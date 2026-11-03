import assert from "node:assert/strict";
import test from "node:test";
import { convertMongoQuery, MONGO_QUERY_EXAMPLE } from "./convert";

test("converts the supplied double-brace Python query into a Compass filter", () => {
  const result = convertMongoQuery(MONGO_QUERY_EXAMPLE, { format: "compact" });
  assert.equal(
    result.output,
    '{"ng":false,"itemName":{"$exists":true},"exportedAt":ISODate("1970-01-01T00:00:00.000Z"),"shareUrl":{"$regex":"douga-pro"},"processedAt":{"$gte":ISODate("2025-01-01T00:00:00.000Z")},"adSentence":{"$exists":true},"parentManageId":{"$exists":true,"$eq":null}}',
  );
  assert.equal(result.warnings.length, 2);
  assert.match(result.warnings[0], /余分/);
  assert.match(result.warnings[1], /UTC/);
});

test("pretty output is indented and preserves nested filter operators", () => {
  assert.equal(
    convertMongoQuery("{'$or': [{'ng': False}, {'count': {'$gte': 2}}]}").output,
    '{\n  "$or": [\n    {\n      "ng": false\n    },\n    {\n      "count": {\n        "$gte": 2\n      }\n    }\n  ]\n}',
  );
});

test("preserves Python keywords and constructor-looking text inside strings", () => {
  const result = convertMongoQuery(
    `{'text': "True False None datetime.datetime(2025, 1, 1)", 'quote': 'it\\'s fine'}`,
    { format: "compact" },
  );
  assert.deepEqual(JSON.parse(result.output), {
    text: "True False None datetime.datetime(2025, 1, 1)",
    quote: "it's fine",
  });
  assert.deepEqual(result.warnings, []);
});

test("preserves regex backslashes, including unknown Python escapes", () => {
  const input = String.raw`{'a': {'$regex': '\\d+\\.jpg$'}, 'b': '\d+\s', 'c': r'\w+\\end'}`;
  const result = JSON.parse(convertMongoQuery(input).output);
  assert.equal(result.a.$regex, String.raw`\d+\.jpg$`);
  assert.equal(result.b, String.raw`\d+\s`);
  assert.equal(result.c, String.raw`\w+\\end`);
});

test("decodes Python repr escapes without turning them into source code", () => {
  const input = String.raw`{'x': '\x41\u3042\U0001f600\n\t\101', 'quoted': '\"'}`;
  assert.deepEqual(JSON.parse(convertMongoQuery(input).output), {
    x: "Aあ😀\n\tA",
    quoted: '"',
  });
});

test("supports JSON literals, tuples, trailing commas and scientific notation", () => {
  const input = `{'a': (True, None, False,), 'b': [1, -2, +3.5, .5, 1e-3,], 'c': {"ok": true,},}`;
  assert.deepEqual(JSON.parse(convertMongoQuery(input).output), {
    a: [true, null, false], b: [1, -2, 3.5, 0.5, 0.001], c: { ok: true },
  });
});

test("distinguishes parentheses that group a value from a one-element tuple", () => {
  assert.deepEqual(JSON.parse(convertMongoQuery("{'scalar': (1), 'tuple': (1,)}").output), {
    scalar: 1, tuple: [1],
  });
});

test("keeps __proto__ and other special dictionary keys as data", () => {
  const output = convertMongoQuery(`{'__proto__': {'polluted': True}, 'constructor': None}`).output;
  assert.equal(Object.hasOwn(JSON.parse(output), "__proto__"), true);
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);
});

test("interprets naive dates as JST when selected and converts to UTC", () => {
  const result = convertMongoQuery("{'d': datetime.datetime(2025, 1, 1)}", { timezone: "Asia/Tokyo" });
  assert.match(result.output, /ISODate\("2024-12-31T15:00:00\.000Z"\)/);
  assert.match(result.warnings[0], /日本時間/);
});

test("explicit UTC overrides the selected naive datetime timezone", () => {
  const result = convertMongoQuery(
    "{'d': datetime.datetime(2025, 1, 1, 12, 30, 59, 123000, tzinfo=datetime.timezone.utc)}",
    { timezone: "Asia/Tokyo" },
  );
  assert.match(result.output, /2025-01-01T12:30:59\.123Z/);
  assert.deepEqual(result.warnings, []);
});

test("tzinfo=None uses the selected naive timezone", () => {
  const result = convertMongoQuery("{'d': datetime.datetime(2025, 1, 1, tzinfo=None)}");
  assert.match(result.output, /2025-01-01T00:00:00\.000Z/);
  assert.equal(result.warnings.length, 1);
});

test("correctly handles years below 100 and leap days", () => {
  assert.match(convertMongoQuery("{'d': datetime.datetime(1, 1, 1)}").output, /0001-01-01/);
  assert.match(convertMongoQuery("{'d': datetime.datetime(2024, 2, 29)}").output, /2024-02-29/);
});

test("emits ObjectId as a BSON constructor", () => {
  assert.equal(
    convertMongoQuery("{'_id': ObjectId('507f1f77bcf86cd799439011')}", { format: "compact" }).output,
    '{"_id":ObjectId("507f1f77bcf86cd799439011")}',
  );
});

test("keeps an intentionally empty filter valid", () => {
  assert.deepEqual(convertMongoQuery("{}"), { output: "{}", warnings: [] });
});

test("rejects invalid calendar dates instead of rolling them into another month", () => {
  for (const args of ["2025, 2, 29", "2025, 4, 31", "2025, 13, 1", "0, 1, 1", "2025, 1, 1, 24"]) {
    assert.throws(() => convertMongoQuery(`{'d': datetime.datetime(${args})}`), /日付|範囲外/);
  }
});

test("rejects unsupported or lossy datetime representations", () => {
  for (const args of ["2025, 1", "2025, 1, 1, 0, 0, 0, 1", "2025, 1, 1, tzinfo=local", "2025, 1, 1, 1.5"]) {
    assert.throws(() => convertMongoQuery(`{'d': datetime.datetime(${args})}`));
  }
});

test("rejects extra expressions, code and unsupported function calls", () => {
  const invalid = [
    "{'a': False}; alert('executed')",
    "{'a': __import__('os').system('whoami')}",
    "{'a': window.location}",
    "{'a': datetime.datetime.now()}",
    "{'a': TrueValue}",
    "{'a': 1 + 2}",
  ];
  for (const input of invalid) assert.throws(() => convertMongoQuery(input));
});

test("rejects non-dictionary filters, invalid strings and incomplete syntax", () => {
  for (const input of ["", "[]", "None", "'text'", "{'a': 1", "{'a': 'unterminated}", "{a: 1}"]) {
    assert.throws(() => convertMongoQuery(input));
  }
  assert.throws(() => convertMongoQuery(String.raw`{'a': '\uZZZZ'}`), /エスケープ/);
  assert.throws(() => convertMongoQuery(String.raw`{'a': '\U00110000'}`), /範囲外/);
});

test("rejects duplicate dictionary keys and invalid ObjectIds", () => {
  assert.throws(() => convertMongoQuery("{'a': 1, 'a': 2}"), /重複/);
  assert.throws(() => convertMongoQuery("{'_id': ObjectId('bad')}"), /24桁/);
});

test("rejects nonfinite and unsafe integer values", () => {
  for (const input of ["{'a': 9007199254740992}", "{'a': 1e999}", "{'a': NaN}"]) {
    assert.throws(() => convertMongoQuery(input));
  }
  assert.match(convertMongoQuery("{'a': 9007199254740991}").output, /9007199254740991/);
});

test("rejects decimal rounding and underflow instead of silently changing values", () => {
  assert.throws(() => convertMongoQuery("{'a': 0.10000000000000001}"), /精度/);
  assert.throws(() => convertMongoQuery("{'a': 1e-1000}"), /精度/);
  assert.deepEqual(JSON.parse(convertMongoQuery("{'a': 1.2300, 'b': 10e-4}").output), {
    a: 1.23, b: 0.001,
  });
});

test("reports the error line and column", () => {
  assert.throws(() => convertMongoQuery("{\n  'a': unknown\n}"), /2行 \d+列/);
});

test("limits input length and nesting depth", () => {
  assert.throws(() => convertMongoQuery(" ".repeat(100_001)), /100,000/);
  assert.throws(() => convertMongoQuery("{'a':".repeat(102) + "1" + "}".repeat(102)), /100階層/);
});
