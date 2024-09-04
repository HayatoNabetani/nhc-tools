import CodeBlock from "@/components/elements/CodeBlock/CodeBlock";
import React, { useState } from "react";
import { toJsPath, toPythonPath } from "../../utils/convert";

interface Props {
  json: string;
}

const JsonViewer = ({ json }: Props) => {
  const [selectedPath, setSelectedPath] = useState("");

  // JSONオブジェクトをHTMLに変換する関数
  const renderJson = (obj: any, parentPath = "") => {
    return Object.entries(obj).map(([key, value], index) => {
      const path = `${parentPath}/${key}`;
      if (typeof value === "object" && value !== null) {
        return (
          <div key={path}>
            <span onDoubleClick={() => setSelectedPath(path)}>{key}:</span>
            <div style={{ marginLeft: "20px" }}>{renderJson(value, path)}</div>
          </div>
        );
      }
      return (
        <div key={path}>
          <span onDoubleClick={() => setSelectedPath(path)}>{key}: </span>
          <span onDoubleClick={() => setSelectedPath(path)}>
            {JSON.stringify(value)}
          </span>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="w-full mx-auto flex justify-between items-center">
        {selectedPath && (
          <>
            <div className="flex-1">
              Selected Path (JavaScript): <br />
              <CodeBlock codeString={toJsPath(selectedPath)} />
            </div>
            <div className="flex-1">
              Selected Path (Python): <br />
              <CodeBlock codeString={toPythonPath(selectedPath)} />
            </div>
          </>
        )}
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="max-h-screen overflow-auto px-4 py-2 border rounded-lg border-black">
          <pre className="text-xs">{renderJson(JSON.parse(json))}</pre>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
