import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import { useState, useMemo } from "react";
import { createArrayString } from "@/lib/convert";

const MakingArray = () => {
  const [arrayInput, setArrayInput] = useState<string>("");
  const [arrayResult, setArrayResult] = useState<string>("");
  const [tupleResult, setTupleResult] = useState<string>("");
  const [spreadsheetResult, setSpreadsheetResult] = useState<string>("");

  // 重複要素を検出
  const duplicateItems = useMemo(() => {
    if (!arrayInput) return [];
    const regex = /[,;\t \n]+/;
    const arrayFromSplit = arrayInput.split(regex).map((item) => item.trim());
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    arrayFromSplit.forEach((item) => {
      if (item && seen.has(item)) {
        duplicates.add(item);
      } else if (item) {
        seen.add(item);
      }
    });

    return Array.from(duplicates);
  }, [arrayInput]);

  // 重複削除後の配列を生成
  const uniqueArray = useMemo(() => {
    if (!arrayInput) return [];
    const regex = /[,;\t \n]+/;
    const arrayFromSplit = arrayInput.split(regex).map((item) => item.trim());
    const seen = new Set<string>();
    return arrayFromSplit.filter((item) => {
      if (!item) return false;
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
  }, [arrayInput]);

  // 重複削除後の結果を生成
  const uniqueArrayResult = useMemo(() => {
    if (uniqueArray.length === 0) return "";
    return createArrayString(uniqueArray);
  }, [uniqueArray]);

  const uniqueTupleResult = useMemo(() => {
    if (uniqueArray.length === 0) return "";
    return `(${uniqueArray.map((item) => `'${item}'`).join(", ")})`;
  }, [uniqueArray]);

  const uniqueSpreadsheetResult = useMemo(() => {
    if (uniqueArray.length === 0) return "";
    return uniqueArray.join("\n");
  }, [uniqueArray]);

  const handleArrayTextAreaChange = (inputString: string) => {
    setArrayInput(inputString);
    if (!inputString) {
      setArrayResult("");
      setTupleResult("");
      setSpreadsheetResult("");
      return;
    }
    const regex = /[,;\t \n]+/;
    const arrayFromSplit = inputString.split(regex);
    setArrayResult(createArrayString(arrayFromSplit));

    // SQLのIN演算子用のタプル文字列を作成
    const tupleString = `(${arrayFromSplit
      .map((item) => `'${item.trim()}'`)
      .join(", ")})`;
    setTupleResult(tupleString);

    // スプレッドシートに列で貼り付けれるような形にする
    const spreadsheetString = arrayFromSplit
      .map((item) => item.trim())
      .join("\n");
    setSpreadsheetResult(spreadsheetString);
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
        <div className="flex-1 pl-1">
          <div>
            <p>
              タプル(コピー用){" "}
              <ButtonOnlyIcon type="copy" value={tupleResult} />
            </p>
            {/* Linter */}
            <TextArea
              id="tupleResultTextArea"
              textAreaLabel="tupleResultTextArea"
              placeholder="ここにタプル出力"
              value={tupleResult}
              disabled={true}
              onChange={handleArrayTextAreaChange}
            />
          </div>
        </div>
        <div className="flex-1 pl-1">
          <div>
            <p>
              スプレッドシートに列で貼り付けれるような形にする(コピー用){" "}
              <ButtonOnlyIcon type="copy" value={spreadsheetResult} />
            </p>
            {/* Linter */}
            <TextArea
              id="sheetResultTextArea"
              textAreaLabel="sheetResultTextArea"
              placeholder="ここに出力"
              value={spreadsheetResult}
              disabled={true}
              onChange={handleArrayTextAreaChange}
            />
          </div>
        </div>
      </div>

      {/* 重複要素の表示と重複削除後の結果 */}
      {duplicateItems.length > 0 && (
        <div className="w-full mb-10">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-semibold text-yellow-800 mb-2">
              重複要素が検出されました:
            </p>
            <div className="flex flex-wrap gap-2">
              {duplicateItems.map((item, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-between w-full">
            <div className="flex-1 pr-1">
              <div>
                <p>
                  重複削除後の配列(コピー用){" "}
                  <ButtonOnlyIcon type="copy" value={uniqueArrayResult} />
                </p>
                <TextArea
                  id="uniqueArrayResultTextArea"
                  textAreaLabel="uniqueArrayResultTextArea"
                  placeholder="ここに重複削除後の配列出力"
                  value={uniqueArrayResult}
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
            </div>
            <div className="flex-1 pl-1">
              <div>
                <p>
                  重複削除後のタプル(コピー用){" "}
                  <ButtonOnlyIcon type="copy" value={uniqueTupleResult} />
                </p>
                <TextArea
                  id="uniqueTupleResultTextArea"
                  textAreaLabel="uniqueTupleResultTextArea"
                  placeholder="ここに重複削除後のタプル出力"
                  value={uniqueTupleResult}
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
            </div>
            <div className="flex-1 pl-1">
              <div>
                <p>
                  重複削除後のスプレッドシート用(コピー用){" "}
                  <ButtonOnlyIcon type="copy" value={uniqueSpreadsheetResult} />
                </p>
                <TextArea
                  id="uniqueSheetResultTextArea"
                  textAreaLabel="uniqueSheetResultTextArea"
                  placeholder="ここに重複削除後の出力"
                  value={uniqueSpreadsheetResult}
                  disabled={true}
                  onChange={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MakingArray;
