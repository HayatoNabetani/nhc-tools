import TextArea from "@/components/elements/TextArea/TextArea";
import TextInput from "@/components/elements/TextInput/TextInput";
import { KeyValueInputs } from "../utils/convert";

interface Props {
  keyValueInputs: KeyValueInputs;
  keyInput: string;
  valueInput: string[];
  createResult: (newKeyValueInputs: KeyValueInputs) => void;
}

const KeyValueCard = ({
  keyValueInputs,
  keyInput,
  valueInput,
  createResult,
}: Props) => {
  const handleKeyChange = (value: string) => {
    // スプレッド構文でキーを差し替えると順番が変わってしまうため、
    // エントリを組み直してキー名だけ置き換える
    const newKeyValueInputs = Object.fromEntries(
      Object.entries(keyValueInputs).map(([key, val]) =>
        key === keyInput ? [value, valueInput] : [key, val]
      )
    );
    createResult(newKeyValueInputs);
  };

  const handleValueChange = (value: string) => {
    const arrayFromSplit = value.split(/[,;\t \n]+/);
    createResult({
      ...keyValueInputs,
      [keyInput]: arrayFromSplit,
    });
  };

  return (
    <div>
      <div>
        <TextInput
          id={`key-${keyInput}`}
          textAreaLabel="キー"
          placeholder="キーを入力"
          value={keyInput}
          onChange={handleKeyChange}
        />
      </div>
      <div>
        <TextArea
          id={`value-${keyInput}`}
          textAreaLabel="値"
          placeholder="値を入力"
          value={valueInput.join(",")}
          onChange={handleValueChange}
        />
      </div>
    </div>
  );
};

export default KeyValueCard;
