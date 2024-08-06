import TextInput from "@/components/elements/TextInput/TextInput";
import { useState } from "react";
import {
  convertIsoToDatetime,
  convertTimestampToDatetime,
} from "./utils/convert";
import { isNumeric } from "@/lib/validate";

const JstConverter = () => {
  const [timeInput, setTimeInput] = useState<string>("");
  const [jstResult, setJstResult] = useState<string>("");

  const handleJstConvert = (value: string) => {
    setTimeInput(value);
    if (!value) {
      setJstResult("");
      return;
    }
    try {
      if (value.includes("T")) {
        setJstResult(convertIsoToDatetime(value));
      } else {
        if (isNumeric(value)) {
          setJstResult(convertTimestampToDatetime(Number(value)));
        } else {
          setJstResult("対応していない日付形式です。");
        }
      }
    } catch (e) {
      console.log(e);
      setJstResult("対応していない日付形式です。");
    }
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
