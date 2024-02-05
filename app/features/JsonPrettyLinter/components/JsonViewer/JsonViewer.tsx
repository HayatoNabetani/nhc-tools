import CodeBlock from "@/components/elements/CodeBlock/CodeBlock";
import React, { useState } from "react";

interface Props {
  json: string;
}

const JsonViewer = ({ json }: Props) => {
  console.log(json);
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

  // JavaScript形式のパスに変換
  const toJsPath = (path: string) => {
    return path
      .split("/")
      .filter((p) => p !== "")
      .map((p: any) => (isNaN(p) ? `.${p}` : `[${p}]`))
      .join("");
  };

  // Python形式のパスに変換
  const toPythonPath = (path: string) => {
    return path
      .split("/")
      .filter((p) => p !== "")
      .map((p: any) => (isNaN(p) ? `["${p}"]` : `[${p}]`))
      .join("");
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="w-1/2">
        <div className="max-h-screen overflow-auto px-4 py-2 border rounded-lg border-black">
          <pre>{renderJson(JSON.parse(json))}</pre>
        </div>
      </div>
      <div className="w-1/2">
        <div className="w-full mx-auto p-12">
          {selectedPath && (
            <>
              <p className="mb-10">
                Selected Path (JavaScript): <br />
                <CodeBlock codeString={toJsPath(selectedPath)} />
              </p>
              <p>
                Selected Path (Python): <br />
                <CodeBlock codeString={toPythonPath(selectedPath)} />
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
