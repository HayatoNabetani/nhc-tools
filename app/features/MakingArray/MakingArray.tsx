import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import TextArea from "@/components/elements/TextArea/TextArea";
import { useState, useMemo } from "react";
import { createArrayString } from "@/lib/convert";

const SEPARATOR_REGEX = /[,;\t \n]+/;

// SQLのIN演算子用のタプル文字列を作成
const createTupleString = (items: string[]) =>
  `(${items.map((item) => `'${item}'`).join(", ")})`;

// スプレッドシートに列で貼り付けられる形にする
const createSpreadsheetString = (items: string[]) => items.join("\n");

const buildOutputs = (
  items: string[],
  idPrefix: string,
  labelPrefix: string,
) => [
  {
    id: `${idPrefix}ArrayResultTextArea`,
    label: `${labelPrefix}配列(コピー用)`,
    placeholder: "ここに配列出力",
    value: items.length > 0 ? createArrayString(items) : "",
  },
  {
    id: `${idPrefix}TupleResultTextArea`,
    label: `${labelPrefix}タプル(コピー用)`,
    placeholder: "ここにタプル出力",
    value: items.length > 0 ? createTupleString(items) : "",
  },
  {
    id: `${idPrefix}SheetResultTextArea`,
    label: `${labelPrefix}スプレッドシート用(コピー用)`,
    placeholder: "ここに出力",
    value: items.length > 0 ? createSpreadsheetString(items) : "",
  },
];

const MakingArray = () => {
  const [arrayInput, setArrayInput] = useState<string>("");

  // 入力を区切り文字で分割した要素一覧
  const items = useMemo(
    () =>
      arrayInput
        .split(SEPARATOR_REGEX)
        .map((item) => item.trim())
        .filter(Boolean),
    [arrayInput],
  );

  // 重複要素を検出
  const duplicateItems = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    items.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });
    return Array.from(duplicates);
  }, [items]);

  // 重複削除後の配列
  const uniqueItems = useMemo(() => Array.from(new Set(items)), [items]);

  const outputs = useMemo(() => buildOutputs(items, "", ""), [items]);
  const uniqueOutputs = useMemo(
    () => buildOutputs(uniqueItems, "unique", "重複削除後の"),
    [uniqueItems],
  );

  return (
    <div className="w-full">
      {/* 配列の長さ表示 */}
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          配列の長さ: {items.length}
        </span>
        {duplicateItems.length > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            重複削除後: {uniqueItems.length}
          </span>
        )}
      </div>

      {/* 整形部分 */}
      <div className="array-grid">
        <div>
          <p>テキストを入力（カンマ・改行などで区切り）</p>
          <TextArea
            id="arrayTextArea"
            textAreaLabel="変換するテキスト"
            placeholder="ここに文字列を入力"
            value={arrayInput}
            onChange={setArrayInput}
          />
        </div>
        {outputs.map((output) => (
          <div key={output.id}>
            <p>
              {output.label} <ButtonOnlyIcon type="copy" value={output.value} />
            </p>
            <TextArea
              id={output.id}
              textAreaLabel={output.label}
              placeholder={output.placeholder}
              value={output.value}
              disabled={true}
            />
          </div>
        ))}
      </div>

      {/* 重複要素の表示と重複削除後の結果 */}
      {duplicateItems.length > 0 && (
        <div className="w-full mb-10">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="font-semibold text-yellow-800 mb-2">
              重複要素が検出されました:
            </p>
            <div className="flex flex-wrap gap-2">
              {duplicateItems.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="array-grid array-grid-unique">
            {uniqueOutputs.map((output) => (
              <div key={output.id}>
                <p>
                  {output.label}{" "}
                  <ButtonOnlyIcon type="copy" value={output.value} />
                </p>
                <TextArea
                  id={output.id}
                  textAreaLabel={output.label}
                  placeholder={`ここに${output.label.replace("(コピー用)", "")}出力`}
                  value={output.value}
                  disabled={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MakingArray;
