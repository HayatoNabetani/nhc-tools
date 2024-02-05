import Button from "@/components/elements/Button/Button";
import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";

const JsonTextArea = () => {
  return (
    <div className="w-2/3 mx-auto mb-4 border border-gray-200 rounded-lg bg-gray-50">
      {/* テキストエリア */}
      <TextArea />
      <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
        {/* 通常提出ボタン */}
        <Button />

        <div className="flex ps-0 space-x-1 rtl:space-x-reverse sm:ps-2">
          {/* ここに複数 */}
          <ButtonOnlyIcon />
        </div>
      </div>
    </div>
  );
};

export default JsonTextArea;
