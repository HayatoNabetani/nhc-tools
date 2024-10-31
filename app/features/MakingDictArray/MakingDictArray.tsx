import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import { useState } from "react";
import { transformToObjectsWithCycle } from "./utils/convert";

import KeyValueCard from "./components/KeyValueCard";
import Button from "@/components/elements/Button/Button";
import { createArrayString } from "@/lib/convert";

const MakingDictArray = () => {
  const [keyValueInputs, setKeyValueInputs] = useState<any>({
    test: ["test", "test2"],
  });

  const [arrayResult, setArrayResult] = useState<string>("");

  const handleArrayTextAreaChange = () => {
    console.log("test");
  };

  const handleAddKeyValue = () => {
    const insertKeyValue = { "": ["値を入力1", "値を入力2"] };

    if (Object.keys(keyValueInputs).includes("")) {
      alert("空欄のキーが重複しています");
      return;
    }

    const newKeyValueInputs = {
      ...keyValueInputs,
      ...insertKeyValue,
    };

    createResult(newKeyValueInputs);
  };

  const createResult = (newKeyValueInputs: any) => {
    // 追加
    setKeyValueInputs(newKeyValueInputs);

    // 配列出力
    const arrayResult = transformToObjectsWithCycle(newKeyValueInputs);
    setArrayResult(createArrayString(arrayResult));
  };

  return (
    <div className="w-full">
      {/* 整形部分 */}
      <div>
        <p>
          配列(コピー用) <ButtonOnlyIcon type="copy" value={arrayResult} />
        </p>
        <div>
          <TextArea
            id="arrayResultTextArea"
            textAreaLabel="arrayResultTextArea"
            placeholder="ここに配列出力"
            value={arrayResult}
            disabled={true}
            onChange={handleArrayTextAreaChange}
          />
        </div>
        <div>
          <Button text="追加" handleClick={handleAddKeyValue} />
        </div>
        <div className="flex">
          {Object.keys(keyValueInputs).map((key, index) => (
            <KeyValueCard
              key={index}
              keyValueInputs={keyValueInputs}
              createResult={createResult}
              keyInput={key}
              valueInput={keyValueInputs[key]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MakingDictArray;
