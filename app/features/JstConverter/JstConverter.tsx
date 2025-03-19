import TextInput from "@/components/elements/TextInput/TextInput";
import { useConvert } from "./hooks/useConvert";

const JstConverter = () => {
  const { timeInput, jstResult, handleJstConvert } = useConvert();

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
