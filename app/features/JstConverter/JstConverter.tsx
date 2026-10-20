import TextInput from "@/components/elements/TextInput/TextInput";
import { useConvert } from "./hooks/useConvert";

const JstConverter = () => {
  const { timeInput, jstResult, handleJstConvert } = useConvert();

  return (
    <div className="jst-layout">
      <div className="min-w-0">
        <div>
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
      <div className="jst-result">
        <p>日本時間（JST）</p>
        <output aria-live="polite">
          {jstResult || "変換した日時がここに表示されます"}
        </output>
      </div>
    </div>
  );
};

export default JstConverter;
