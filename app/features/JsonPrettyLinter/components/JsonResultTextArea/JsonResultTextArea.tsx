import TextArea from "@/components/elements/TextArea/TextArea";

interface Props {
  jsonResult: string;
}

const JsonResultTextArea = ({ jsonResult }: Props) => {
  const onC = () => {
    console.log("a")
  }
  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* テキストエリア */}
      <TextArea
        id="jsonResult"
        textAreaLabel="jsonResult"
        placeholder="jsonResult"
        value={jsonResult}
        onChange={onC}
        disabled={true}
      />
    </div>
  );
};

export default JsonResultTextArea;
