export const MONGO_QUERY_EXAMPLE = `{{'ng': False, 'itemName': {'$exists': True}, 'exportedAt': datetime.datetime(1970, 1, 1, 0, 0), 'shareUrl': {'$regex': 'douga-pro'}, 'processedAt': {'$gte': datetime.datetime(2025, 1, 1, 0, 0)}, 'adSentence': {'$exists': True}, 'parentManageId': {'$exists': True, '$eq': None}}}`;

export interface MongoQueryOptions {
  timezone?: "UTC" | "Asia/Tokyo";
  format?: "pretty" | "compact";
}

type QueryObject = { kind: "object"; entries: [string, QueryValue][] };
type MongoLiteral = { kind: "date" | "objectId"; value: string };
type QueryValue =
  | string
  | number
  | boolean
  | null
  | QueryObject
  | MongoLiteral
  | QueryValue[];

const MAX_INPUT_LENGTH = 100_000;
const MAX_DEPTH = 100;

class QueryParser {
  private position = 0;
  readonly warnings: string[] = [];
  private hasNaiveDate = false;

  constructor(
    private readonly source: string,
    private readonly timezone: "UTC" | "Asia/Tokyo",
  ) {}

  parse(): QueryObject {
    this.skipWhitespace();
    if (!this.source.trim()) this.fail("クエリを入力してください。");

    // Some copied Python representations have one redundant pair of braces.
    const wrapped = /^\{\s*\{/.test(this.source.slice(this.position));
    if (wrapped) this.position++;
    const result = this.parseValue(0);
    if (wrapped) {
      this.expect("}");
      this.warnings.push("外側の余分な { } を1組取り除きました。");
    }
    this.skipWhitespace();
    if (this.position !== this.source.length) {
      this.fail("クエリの末尾に余分な文字があります。");
    }
    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      result.kind !== "object"
    ) {
      this.fail("検索フィルターは { } で囲んだ辞書にしてください。");
    }
    if (this.hasNaiveDate) {
      this.warnings.push(
        this.timezone === "UTC"
          ? "タイムゾーンのない datetime は UTC として変換しています。"
          : "タイムゾーンのない datetime は日本時間（JST）として解釈し、UTC に変換しています。",
      );
    }
    return result;
  }

  private parseValue(depth: number): QueryValue {
    if (depth > MAX_DEPTH) this.fail("入れ子は100階層までにしてください。");
    this.skipWhitespace();
    const char = this.source[this.position];
    if (char === "{") return this.parseObject(depth + 1);
    if (char === "[") return this.parseArray(depth + 1, "]");
    if (char === "(") return this.parseArray(depth + 1, ")");
    if (char === "'" || char === '"') return this.parseString();
    if (char && /[+\-\d.]/.test(char)) return this.parseNumber();

    const name = this.readName();
    if (name === "True" || name === "true") return true;
    if (name === "False" || name === "false") return false;
    if (name === "None" || name === "null") return null;
    if (
      /^(r|u|ur|ru)$/i.test(name) &&
      (this.source[this.position] === "'" ||
        this.source[this.position] === '"')
    ) {
      return this.parseString(/r/i.test(name));
    }
    if (name === "datetime.datetime" || name === "datetime") {
      return this.parseDate();
    }
    if (name === "ObjectId" || name === "bson.ObjectId") {
      this.expect("(");
      this.skipWhitespace();
      if (!['"', "'"].includes(this.source[this.position])) {
        this.fail("ObjectId には24桁の16進文字列を指定してください。");
      }
      const value = this.parseString();
      this.expect(")");
      if (!/^[a-f\d]{24}$/i.test(value)) {
        this.fail("ObjectId には24桁の16進文字列を指定してください。");
      }
      return { kind: "objectId", value };
    }
    this.fail(
      name
        ? `「${name}」には対応していません。Pythonの値と datetime.datetime(...) を入力してください。`
        : "値を読み取れません。引用符や括弧を確認してください。",
    );
  }

  private parseObject(depth: number): QueryObject {
    this.expect("{");
    const entries: [string, QueryValue][] = [];
    const keys = new Set<string>();
    this.skipWhitespace();
    if (this.consume("}")) return { kind: "object", entries };
    while (true) {
      this.skipWhitespace();
      if (!['"', "'"].includes(this.source[this.position])) {
        this.fail("辞書のキーはシングルまたはダブルクォートで囲んでください。");
      }
      const key = this.parseString();
      if (keys.has(key)) this.fail(`キー「${key}」が重複しています。`);
      keys.add(key);
      this.expect(":");
      entries.push([key, this.parseValue(depth)]);
      this.skipWhitespace();
      if (this.consume("}")) break;
      this.expect(",");
      this.skipWhitespace();
      if (this.consume("}")) break;
    }
    return { kind: "object", entries };
  }

  private parseArray(depth: number, end: "]" | ")"): QueryValue {
    this.position++;
    const values: QueryValue[] = [];
    let hasComma = false;
    this.skipWhitespace();
    if (this.consume(end)) return values;
    while (true) {
      values.push(this.parseValue(depth));
      this.skipWhitespace();
      if (this.consume(end)) break;
      this.expect(",");
      hasComma = true;
      this.skipWhitespace();
      if (this.consume(end)) break;
    }
    // Parentheses without a comma group one value; they do not make a tuple.
    return end === ")" && !hasComma && values.length === 1 ? values[0] : values;
  }

  private parseString(raw = false): string {
    const quote = this.source[this.position++];
    let result = "";
    while (this.position < this.source.length) {
      const char = this.source[this.position++];
      if (char === quote) return result;
      if (char === "\n" || char === "\r") {
        this.fail("文字列内の改行は \\n のようにエスケープしてください。");
      }
      if (char !== "\\") {
        result += char;
        continue;
      }
      const escaped = this.source[this.position++];
      if (escaped === undefined) this.fail("文字列の引用符が閉じていません。");
      if (raw) {
        result += "\\" + escaped;
        continue;
      }
      const escapes: Record<string, string> = {
        "\\": "\\",
        "'": "'",
        '"': '"',
        a: "\x07",
        b: "\b",
        f: "\f",
        n: "\n",
        r: "\r",
        t: "\t",
        v: "\v",
      };
      if (Object.hasOwn(escapes, escaped)) {
        result += escapes[escaped];
      } else if (escaped === "\n") {
        // Python backslash-newline continuation does not add a character.
      } else if (escaped === "x" || escaped === "u" || escaped === "U") {
        const count = escaped === "x" ? 2 : escaped === "u" ? 4 : 8;
        const hex = this.source.slice(this.position, this.position + count);
        if (hex.length !== count || !/^[a-f\d]+$/i.test(hex)) {
          this.fail("文字列のUnicode・16進エスケープが正しくありません。");
        }
        const codePoint = parseInt(hex, 16);
        if (codePoint > 0x10ffff) this.fail("Unicodeの文字コードが範囲外です。");
        result += String.fromCodePoint(codePoint);
        this.position += count;
      } else if (/[0-7]/.test(escaped)) {
        const rest = this.source.slice(this.position).match(/^[0-7]{0,2}/)![0];
        result += String.fromCharCode(parseInt(escaped + rest, 8));
        this.position += rest.length;
      } else if (escaped === "N") {
        this.fail("名前付きUnicodeエスケープには対応していません。");
      } else {
        // Python leaves unrecognized escapes (e.g. regex \d) unchanged.
        result += "\\" + escaped;
      }
    }
    this.fail("文字列の引用符が閉じていません。");
  }

  private parseNumber(): number {
    const match = this.source
      .slice(this.position)
      .match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/);
    if (!match) this.fail("数値が正しくありません。");
    this.position += match[0].length;
    const value = Number(match[0]);
    if (!Number.isFinite(value)) this.fail("有限の数値を指定してください。");
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      this.fail("整数が安全に変換できる範囲を超えています（±9007199254740991まで）。");
    }
    if (normalizeDecimal(match[0]) !== normalizeDecimal(String(value))) {
      this.fail("数値の桁数が多すぎるか小さすぎるため、精度を保って変換できません。");
    }
    return value;
  }

  private parseDate(): MongoLiteral {
    this.expect("(");
    const args: number[] = [];
    let explicitUtc = false;
    let timezoneSeen = false;
    this.skipWhitespace();
    while (!this.consume(")")) {
      this.skipWhitespace();
      if (/^tzinfo\s*=/.test(this.source.slice(this.position))) {
        if (timezoneSeen) this.fail("tzinfo が重複しています。");
        timezoneSeen = true;
        this.readName();
        this.expect("=");
        const name = this.readName();
        if (name === "datetime.timezone.utc" || name === "timezone.utc") {
          explicitUtc = true;
        } else if (name !== "None") {
          this.fail("tzinfo は datetime.timezone.utc または None に対応しています。");
        }
      } else {
        if (timezoneSeen) this.fail("tzinfo の後に位置引数は指定できません。");
        const value = this.parseNumber();
        if (!Number.isInteger(value)) this.fail("datetime の引数は整数にしてください。");
        args.push(value);
      }
      this.skipWhitespace();
      if (this.consume(")")) break;
      this.expect(",");
      this.skipWhitespace();
    }
    if (args.length < 3 || args.length > 7) {
      this.fail("datetime には年・月・日と、任意で時・分・秒・マイクロ秒を指定してください。");
    }
    const [year, month, day, hour = 0, minute = 0, second = 0, microsecond = 0] = args;
    if (
      year < 1 || year > 9999 || month < 1 || month > 12 ||
      day < 1 || day > 31 || hour < 0 || hour > 23 ||
      minute < 0 || minute > 59 || second < 0 || second > 59 ||
      microsecond < 0 || microsecond > 999999
    ) {
      this.fail("datetime の年月日・時刻が範囲外です。");
    }
    if (microsecond % 1000 !== 0) {
      this.fail("MongoDBの日付はミリ秒精度です。マイクロ秒は1000の倍数にしてください。");
    }
    // setUTCFullYear avoids JavaScript's special interpretation of years 0–99.
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, microsecond / 1000);
    if (
      date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      this.fail("datetime に存在しない日付が指定されています。");
    }
    if (!explicitUtc) {
      this.hasNaiveDate = true;
      if (this.timezone === "Asia/Tokyo") date.setTime(date.getTime() - 9 * 60 * 60 * 1000);
    }
    return { kind: "date", value: date.toISOString() };
  }

  private readName(): string {
    this.skipWhitespace();
    const name = this.source
      .slice(this.position)
      .match(/^[A-Za-z_][A-Za-z_\d]*(?:\.[A-Za-z_][A-Za-z_\d]*)*/)?.[0] ?? "";
    this.position += name.length;
    return name;
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.source[this.position] ?? "") && this.position < this.source.length) {
      this.position++;
    }
  }

  private consume(char: string): boolean {
    if (this.source[this.position] !== char) return false;
    this.position++;
    return true;
  }

  private expect(char: string): void {
    this.skipWhitespace();
    if (!this.consume(char)) this.fail(`「${char}」が必要です。括弧や区切りを確認してください。`);
  }

  private fail(message: string): never {
    const before = this.source.slice(0, this.position);
    const line = before.split("\n").length;
    const column = this.position - before.lastIndexOf("\n");
    throw new Error(`${message}（${line}行 ${column}列）`);
  }
}

// Compare decimal spellings without first rounding the source through Number.
// This detects underflow and literals such as 0.10000000000000001 becoming 0.1.
function normalizeDecimal(value: string): string {
  const negative = value.startsWith("-");
  const [mantissa, exponent = "0"] = value.replace(/^[+-]/, "").toLowerCase().split("e");
  const [integer, fraction = ""] = mantissa.split(".");
  const digits = (integer + fraction).replace(/^0+/, "");
  if (!digits) return "0";
  const significant = digits.replace(/0+$/, "");
  const scale = Number(exponent) - fraction.length + digits.length - significant.length;
  return `${negative ? "-" : ""}${significant}e${scale}`;
}

function formatValue(value: QueryValue, pretty: boolean, depth = 0): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (!Array.isArray(value) && value.kind !== "object") {
    return `${value.kind === "date" ? "ISODate" : "ObjectId"}(${JSON.stringify(value.value)})`;
  }
  const isArray = Array.isArray(value);
  const parts = isArray
    ? value.map((item) => formatValue(item, pretty, depth + 1))
    : value.entries.map(([key, item]) =>
        `${JSON.stringify(key)}:${pretty ? " " : ""}${formatValue(item, pretty, depth + 1)}`,
      );
  const start = isArray ? "[" : "{";
  const end = isArray ? "]" : "}";
  if (!parts.length) return start + end;
  if (!pretty) return start + parts.join(",") + end;
  const indent = "  ".repeat(depth + 1);
  return `${start}\n${indent}${parts.join(`,\n${indent}`)}\n${"  ".repeat(depth)}${end}`;
}

/** Parse Python values without evaluating input, then emit a Compass filter. */
export function convertMongoQuery(
  input: string,
  options: MongoQueryOptions = {},
): { output: string; warnings: string[] } {
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error("クエリは100,000文字以内で入力してください。");
  }
  const parser = new QueryParser(input, options.timezone ?? "UTC");
  const query = parser.parse();
  return {
    output: formatValue(query, options.format !== "compact"),
    warnings: parser.warnings,
  };
}
