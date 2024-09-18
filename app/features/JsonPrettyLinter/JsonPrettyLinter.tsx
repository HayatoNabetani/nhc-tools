"use client";
import JsonFormatter from "react-json-formatter";
import { useState } from "react";
import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import JsonViewer from "./components/JsonViewer/JsonViewer";
import JsonTextArea from "./components/JsonTextArea/JsonTextArea";
import JsonResultTextArea from "./components/JsonResultTextArea/JsonResultTextArea";

const JsonPrettyLinter = () => {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [jsonError, setJsonError] = useState<string>("");
  const [jsonPrettyLinterResult, setJsonJsonPrettyLinterResult] =
    useState<string>("");

  return (
    <div className="w-full">
      {jsonInput && jsonError ? (
        <div className="w-full">
          <div className="flex-1">
            <div>
              <div>構文エラー</div>
              <div>{jsonError}</div>
            </div>
          </div>
        </div>
      ) : (
        <div>正しいJSON形式です</div>
      )}
      {/* 整形部分 */}
      <div className="flex justify-between w-full mb-3">
        <div className="flex-1 pr-1">
          <div>
            <p>整形前</p>
            <JsonTextArea
              jsonInput={jsonInput}
              setJsonInput={setJsonInput}
              setJsonError={setJsonError}
              setJsonJsonPrettyLinterResult={setJsonJsonPrettyLinterResult}
            />
          </div>
        </div>
        <div className="flex-1 pl-1">
          <div>
            <p>
              整形後(コピー用){" "}
              <ButtonOnlyIcon type="copy" value={jsonPrettyLinterResult} />
            </p>
            {/* Linter */}
            <JsonResultTextArea jsonResult={jsonPrettyLinterResult} />
          </div>
        </div>
      </div>
      {/* ビューワー */}
      {jsonPrettyLinterResult && <JsonViewer json={jsonPrettyLinterResult} />}
    </div>
  );
};

export default JsonPrettyLinter;
