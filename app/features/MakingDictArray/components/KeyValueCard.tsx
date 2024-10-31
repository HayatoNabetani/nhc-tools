import TextArea from "@/components/elements/TextArea/TextArea";
import TextInput from "@/components/elements/TextInput/TextInput";

interface Props {
  keyValueInputs: any;
  keyInput: string;
  valueInput: string;
  createResult: (newKeyValueInputs: any) => void;
}

const KeyValueCard = ({
  keyValueInputs,
  keyInput,
  valueInput,
  createResult,
}: Props) => {
  const handleKeyChange = (value: string) => {
    // これだと順番が変わる
    // const { [keyInput]: _, ...rest } = keyValueInputs;
    // const newKeyValueInputs = {
    //   ...rest,
    //   [value]: valueInput,
    // };
    const newKeyValueInputs = Object.fromEntries(
      Object.entries(keyValueInputs).map(([key, val]) =>
        key === keyInput ? [value, valueInput] : [key, val]
      )
    );
    createResult(newKeyValueInputs);
  };

  const handleValueChange = (value: string) => {
    const regex = /[,;\t \n]+/;
    const arrayFromSplit = value.split(regex);
    const newKeyValueInputs = {
      ...keyValueInputs,
      [keyInput]: arrayFromSplit,
    };
    createResult(newKeyValueInputs);
  };

  return (
    <div>
      <div>
        <TextInput
          id={keyInput}
          textAreaLabel={"キー"}
          placeholder={"キーを入力"}
          value={keyInput}
          disabled={false}
          onChange={handleKeyChange}
        />
      </div>
      <div>
        <TextArea
          id={valueInput}
          textAreaLabel={"値"}
          placeholder={"値を入力"}
          value={valueInput}
          disabled={false}
          onChange={handleValueChange}
        />
      </div>
    </div>
  );
};

export default KeyValueCard;
