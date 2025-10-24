import TextArea from "@/components/elements/TextArea/TextArea";
import JSON5 from "json5";

interface Props {
  jsonInput: string;
  setJsonInput: (value: string) => void;
  setJsonError: (value: string) => void;
  setJsonJsonPrettyLinterResult: (value: string) => void;
}

const JsonTextArea = ({
  jsonInput,
  setJsonInput,
  setJsonError,
  setJsonJsonPrettyLinterResult,
}: Props) => {
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

  /**
   * 長い文字列をランダムな短い文字列に置き換える関数
   */
  const replaceLongStrings = (input: string): string => {
    try {
      // より安全な正規表現で、エスケープされた文字も考慮
      return input.replace(/"((?:[^"\\]|\\.){100,})"/g, (match, content) => {
        // URL文字列かどうかをチェック
        if (content.startsWith("http://") || content.startsWith("https://")) {
          return match; // URL文字列は置き換えない
        }

        // JSON文字列内の長い文字列（URL以外）を置き換え
        const randomString = generateRandomString(12);
        return `"${randomString}"`;
      });
    } catch (error) {
      console.warn("String replacement failed:", error);
      return input; // エラーの場合は元の文字列を返す
    }
  };

  /**
   * 長い文字列を置き換えるボタンのハンドラー
   */
  const handleReplaceLongStrings = () => {
    try {
      // まず正規表現ベースの置き換えを試行
      let replaced = replaceLongStrings(jsonInput);

      // JSONが有効かチェック
      try {
        JSON5.parse(replaced);
        setJsonInput(replaced);
        handleJsonFormatAndLint(replaced);
        return;
      } catch (parseError) {
        console.warn(
          "Regex replacement caused parse error, trying object-based replacement"
        );
      }

      // 正規表現で失敗した場合は、オブジェクトベースの置き換えを試行
      try {
        const parsed = JSON5.parse(jsonInput);
        const replacedObj = replaceLongStringsInObject(parsed);
        const replacedJson = JSON.stringify(replacedObj, null, 2);
        setJsonInput(replacedJson);
        setJsonJsonPrettyLinterResult(replacedJson);
        setJsonError("");
      } catch (objError) {
        console.warn("Object-based replacement also failed:", objError);
        setJsonError(
          "⚠️ 文字列置換に失敗しました。元のJSONを確認してください。"
        );
      }
    } catch (error) {
      console.error("String replacement error:", error);
      setJsonError("⚠️ 文字列置換中にエラーが発生しました。");
    }
  };

  /**
   * オブジェクト内の長い文字列を再帰的に置き換える関数
   */
  const replaceLongStringsInObject = (obj: any): any => {
    if (typeof obj === "string") {
      // URL文字列かどうかをチェック
      if (obj.startsWith("http://") || obj.startsWith("https://")) {
        return obj; // URL文字列は置き換えない
      }
      // 100文字以上の文字列を置き換え
      if (obj.length >= 100) {
        return generateRandomString(12);
      }
      return obj;
    } else if (Array.isArray(obj)) {
      return obj.map((item) => replaceLongStringsInObject(item));
    } else if (obj && typeof obj === "object") {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceLongStringsInObject(value);
      }
      return result;
    }
    return obj;
  };

  /**
   * 壊れたJSONを修復または代替する関数
   */
  const tryRepairJson = (input: string): string => {
    let repaired = input;

    // よくある壊れ方を修復
    repaired = repaired
      .replace(/None/g, "null")
      .replace(/False/g, "false")
      .replace(/True/g, "true")
      .replace(/(\b\d+\b)(?=\s*:)/g, '"$1"') // 数字キー
      .replace(/:\s*([A-Za-z0-9_.-]+)(?=\s*[,\}])/g, ': "$1"') // 未クオート値
      .replace(/:\s*([0-9]+)(?=\s*[,\}])/g, ': "$1"') // "9":16 → "9":"16"
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, ""); // 制御文字除去

    return repaired;
  };

  /**
   * JSONを安全に整形
   */
  const handleJsonFormatAndLint = (inputString: string) => {
    setJsonInput(inputString);

    try {
      const formatted = JSON.stringify(JSON5.parse(inputString), null, 2);
      setJsonJsonPrettyLinterResult(formatted);
      setJsonError("");
      return;
    } catch (err1) {
      console.warn("JSON parse error, trying auto-repair:", err1);
    }

    // 修復処理を実施
    const repaired = tryRepairJson(inputString);

    try {
      const parsed = JSON5.parse(repaired);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonJsonPrettyLinterResult(formatted);
      setJsonError("⚠️ 壊れた部分を修復しました。");
    } catch (err2) {
      console.warn("Repair failed:", err2);
      // ← ここで「無理に置換せず、エラー文だけ表示」
      setJsonJsonPrettyLinterResult("");
      setJsonError(`⚠️ JSONパースエラー: ${err2}`);
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
        disabled={false}
        onChange={handleJsonFormatAndLint}
      />
    </div>
  );
};

export default JsonTextArea;
