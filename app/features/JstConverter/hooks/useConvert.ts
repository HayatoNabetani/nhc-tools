import { useState } from "react";
import { handleConvert } from "../utils/convert";

export const useConvert = () => {
  const [timeInput, setTimeInput] = useState<string>("");
  const [jstResult, setJstResult] = useState<string>("");

  const handleJstConvert = (value: string) => {
    setTimeInput(value);
    if (!value) {
      setJstResult("");
      return;
    }

    try {
      setJstResult(handleConvert(value));
    } catch (e) {
      console.error("日付変換エラー:", e);
      setJstResult("対応していない日付形式です。");
    }
  };

  return { timeInput, jstResult, handleJstConvert };
};
