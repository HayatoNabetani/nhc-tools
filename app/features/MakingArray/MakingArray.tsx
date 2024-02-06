import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import { useState } from "react";
import { createArrayString } from "./utils/convert";

const MakingArray = () => {
  const [arrayInput, setArrayInput] = useState<string>("");
  const [arrayResult, setArrayResult] = useState<string>("");

  const handleArrayTextAreaChange = (inputString: string) => {
    setArrayInput(inputString);
    if (!inputString) {
      setArrayResult("");
      return;
    }
    const regex = /[,;\t \n]+/;
    const arrayFromSplit = inputString.split(regex);
    setArrayResult(createArrayString(arrayFromSplit));
    // setArrayResult(JSON.stringify(arrayFromSplit, null, 4));
  };

  return (
    <div className="w-full">
      {/* 整形部分 */}
      <div className="flex justify-between w-full mb-10">
        <div className="flex-1 pr-1">
          <div>
            <p>ここに文字列を入力(対応区切り文字,)</p>
            <TextArea
              id="arrayTextArea"
              textAreaLabel="arrayTextArea"
              placeholder="ここに文字列を入力"
              value={arrayInput}
              disabled={false}
              onChange={handleArrayTextAreaChange}
            />
          </div>
        </div>
        <div className="flex-1 pl-1">
          <div>
            <p>
              配列(コピー用) <ButtonOnlyIcon type="copy" value={arrayResult} />
            </p>
            {/* Linter */}
            <TextArea
              id="arrayResultTextArea"
              textAreaLabel="arrayResultTextArea"
              placeholder="ここに配列出力"
              value={arrayResult}
              disabled={true}
              onChange={handleArrayTextAreaChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakingArray;
