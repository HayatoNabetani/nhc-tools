import Button from "@/components/elements/Button/Button";
import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";

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
   * jsonを整形する関数
   */
  const handleJsonFormatAndLint = (inputString: string) => {
    setJsonInput(inputString);
    try {
      const formattedJson = JSON.stringify(JSON.parse(inputString), null, 2);
      setJsonJsonPrettyLinterResult(formattedJson);
      setJsonError(`正しいJSON形式です!`);
    } catch (error) {
      setJsonJsonPrettyLinterResult("");
      setJsonError(`${error}`);
    }
  };
  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* テキストエリア */}
      <TextArea
        id="jsonInput"
        textAreaLabel="json"
        placeholder="json"
        value={jsonInput}
        disabled={false}
        onChange={handleJsonFormatAndLint}
      />
      {/* <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
        <Button text="整形する" handleClick={handleJsonFormatAndLint} />

        <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
          <ButtonOnlyIcon />
        </div>
      </div> */}
    </div>
  );
};

export default JsonTextArea;
