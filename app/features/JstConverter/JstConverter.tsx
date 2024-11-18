import TextInput from "@/components/elements/TextInput/TextInput";
import { useState } from "react";
import {
  convertIsoToDatetime,
  convertTimestampToDatetime,
  convertUtcToJpDatetime,
} from "./utils/convert";
import { isNumeric } from "@/lib/validate";

const JstConverter = () => {
  const [timeInput, setTimeInput] = useState<string>("");
  const [jstResult, setJstResult] = useState<string>("");

  // メイン処理
  const convertToJST = (value: string) => {
    try {
      if (!value) throw new Error("入力が空です。");

      // ISO形式 (yyyy-MM-ddTHH:mm:ss.sssZ)
      if (value.includes("T")) {
        return convertIsoToDatetime(value);
      }

      // タイムスタンプ
      if (isNumeric(value)) {
        return convertTimestampToDatetime(Number(value));
      }

      // UTC形式 (yyyy-MM-dd HH:mm:ss.sss+00)
      if (
        value.includes("+00") ||
        value.includes("UTC") ||
        value.includes("Z")
      ) {
        return convertUtcToJpDatetime(value);
      }

      return "対応していない日付形式です。";
    } catch (e) {
      console.error("日付変換エラー:", e);
      return "対応していない日付形式です。";
    }
  };

  const handleJstConvert = (value: string) => {
    setTimeInput(value);
    if (!value) {
      setJstResult("");
      return;
    }
    setJstResult(convertToJST(value));
  };

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-1/2">
        <div className="overflow-auto px-4 py-2">
          <TextInput
            id="time"
            textAreaLabel="時間に関する文字列"
            placeholder="iso形式, timestamp形式など"
            value={timeInput}
            disabled={false}
            onChange={handleJstConvert}
          />
        </div>
      </div>
      <div className="w-1/2 px-4 py-2">
        日本時間: <span className="ml-2 text-2xl font-bold">{jstResult}</span>
      </div>
    </div>
  );
};

export default JstConverter;
