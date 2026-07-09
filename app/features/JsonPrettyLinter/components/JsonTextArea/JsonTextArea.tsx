import TextArea from "@/components/elements/TextArea/TextArea";
import JSON5 from "json5";

interface Props {
  jsonInput: string;
  setJsonInput: (value: string) => void;
  setJsonError: (value: string) => void;
  setJsonJsonPrettyLinterResult: (value: string) => void;
}

/**
 * ランダムな短い文字列を生成する関数
 */
const generateRandomString = (length: number = 8): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isUrlString = (value: string): boolean =>
  value.startsWith("http://") || value.startsWith("https://");

/**
 * JSON文字列内の長い文字列（URL以外）をランダムな短い文字列に置き換える関数
 */
const replaceLongStrings = (input: string): string => {
  // エスケープされた文字も考慮した正規表現
  return input.replace(/"((?:[^"\\]|\\.){100,})"/g, (match, content) => {
    if (isUrlString(content)) {
      return match; // URL文字列は置き換えない
    }
    return `"${generateRandomString(12)}"`;
  });
};

/**
 * オブジェクト内の長い文字列を再帰的に置き換える関数
 */
const replaceLongStringsInObject = (obj: unknown): unknown => {
  if (typeof obj === "string") {
    // URL文字列は置き換えず、100文字以上の文字列のみ置き換える
    if (!isUrlString(obj) && obj.length >= 100) {
      return generateRandomString(12);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceLongStringsInObject(item));
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        replaceLongStringsInObject(value),
      ])
    );
  }
  return obj;
};

// Pythonのリテラル → JSON5で解釈できるリテラル
const PYTHON_LITERALS: Record<string, string> = {
  None: "null",
  True: "true",
  False: "false",
  nan: "NaN",
  inf: "Infinity",
};

/**
 * Pythonのdict/list表記（None, True, False など）をJSON5で読める形に変換する関数
 * シングルクォートはJSON5がそのまま解釈できるため、
 * 文字列リテラルの中身には手を付けず、外側のリテラルだけを置き換える
 */
const normalizePythonLiterals = (input: string): string => {
  let result = "";
  let i = 0;
  while (i < input.length) {
    const char = input[i];

    // 文字列リテラルは中身をそのままコピー（エスケープも考慮）
    if (char === '"' || char === "'") {
      let j = i + 1;
      while (j < input.length) {
        if (input[j] === "\\") {
          j += 2;
        } else if (input[j] === char) {
          j++;
          break;
        } else {
          j++;
        }
      }
      result += input.slice(i, j);
      i = j;
      continue;
    }

    // 識別子トークンを読み取り、Pythonのリテラルなら置き換える
    if (/[A-Za-z_]/.test(char)) {
      let j = i;
      while (j < input.length && /[A-Za-z0-9_]/.test(input[j])) {
        j++;
      }
      const token = input.slice(i, j);
      result += PYTHON_LITERALS[token] ?? token;
      i = j;
      continue;
    }

    result += char;
    i++;
  }
  return result;
};

/**
 * 壊れたJSONを修復または代替する関数
 */
const tryRepairJson = (input: string): string => {
  // よくある壊れ方を修復
  return input
    .replace(/(\b\d+\b)(?=\s*:)/g, '"$1"') // 数字キー
    .replace(/:\s*([A-Za-z0-9_.-]+)(?=\s*[,\}])/g, ': "$1"') // 未クオート値
    .replace(/:\s*([0-9]+)(?=\s*[,\}])/g, ': "$1"') // "9":16 → "9":"16"
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, ""); // 制御文字除去
};

const JsonTextArea = ({
  jsonInput,
  setJsonInput,
  setJsonError,
  setJsonJsonPrettyLinterResult,
}: Props) => {
  /**
   * JSONを安全に整形
   */
  const handleJsonFormatAndLint = (inputString: string) => {
    setJsonInput(inputString);

    // JSON5として、またはPython形式（None/True/False・シングルクォート）として解釈を試みる
    // どちらも正式サポートの形式なので、成功すれば警告なしの正常扱いにする
    const normalized = normalizePythonLiterals(inputString);
    for (const candidate of [inputString, normalized]) {
      try {
        const formatted = JSON.stringify(JSON5.parse(candidate), null, 2);
        setJsonJsonPrettyLinterResult(formatted);
        setJsonError("");
        return;
      } catch {
        // 次の候補を試す
      }
    }

    // 修復処理を実施
    const repaired = tryRepairJson(normalized);

    try {
      const parsed = JSON5.parse(repaired);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonJsonPrettyLinterResult(formatted);
      setJsonError("⚠️ 壊れた部分を修復しました。");
    } catch (err2) {
      console.warn("Repair failed:", err2);
      // 無理に置換せず、エラー文だけ表示
      setJsonJsonPrettyLinterResult("");
      setJsonError(`⚠️ JSONパースエラー: ${err2}`);
    }
  };

  /**
   * 長い文字列を置き換えるボタンのハンドラー
   */
  const handleReplaceLongStrings = () => {
    // まず正規表現ベースの置き換えを試行
    const replaced = replaceLongStrings(jsonInput);

    try {
      JSON5.parse(replaced);
      setJsonInput(replaced);
      handleJsonFormatAndLint(replaced);
      return;
    } catch {
      console.warn(
        "Regex replacement caused parse error, trying object-based replacement"
      );
    }

    // 正規表現で失敗した場合は、オブジェクトベースの置き換えを試行
    try {
      const parsed = JSON5.parse(jsonInput);
      const replacedJson = JSON.stringify(
        replaceLongStringsInObject(parsed),
        null,
        2
      );
      setJsonInput(replacedJson);
      setJsonJsonPrettyLinterResult(replacedJson);
      setJsonError("");
    } catch (objError) {
      console.warn("Object-based replacement also failed:", objError);
      setJsonError("⚠️ 文字列置換に失敗しました。元のJSONを確認してください。");
    }
  };

  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="p-3 border-b border-gray-200 bg-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">JSON入力</span>
          <button
            onClick={handleReplaceLongStrings}
            className="px-3 py-1 text-xs bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            title="100文字以上の文字列をランダムな短い文字列に置き換えます"
          >
            長い文字列を置換
          </button>
        </div>
      </div>
      <TextArea
        id="jsonInput"
        textAreaLabel="json"
        placeholder="json"
        value={jsonInput}
        onChange={handleJsonFormatAndLint}
      />
    </div>
  );
};

export default JsonTextArea;
