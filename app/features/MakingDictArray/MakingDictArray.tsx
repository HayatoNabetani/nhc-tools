import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import { useState } from "react";
import {
  KeyValueInputs,
  transformToObjectsWithCycle,
} from "./utils/convert";

import KeyValueCard from "./components/KeyValueCard";
import Button from "@/components/elements/Button/Button";
import { createArrayString } from "@/lib/convert";

const MakingDictArray = () => {
  const [keyValueInputs, setKeyValueInputs] = useState<KeyValueInputs>({
    test: ["test", "test2"],
  });

  const [arrayResult, setArrayResult] = useState<string>("");

  const createResult = (newKeyValueInputs: KeyValueInputs) => {
    setKeyValueInputs(newKeyValueInputs);
    setArrayResult(
      createArrayString(transformToObjectsWithCycle(newKeyValueInputs))
    );
  };

  const handleAddKeyValue = () => {
    if ("" in keyValueInputs) {
      alert("空欄のキーが重複しています");
      return;
    }

    createResult({
      ...keyValueInputs,
      "": ["値を入力1", "値を入力2"],
    });
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
          />
        </div>
        <div>
          <Button text="追加" handleClick={handleAddKeyValue} />
        </div>
        <div className="flex">
          {Object.entries(keyValueInputs).map(([key, values], index) => (
            <KeyValueCard
              key={index}
              keyValueInputs={keyValueInputs}
              createResult={createResult}
              keyInput={key}
              valueInput={values}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MakingDictArray;
