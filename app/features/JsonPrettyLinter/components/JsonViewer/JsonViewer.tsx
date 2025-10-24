import CodeBlock from "@/components/elements/CodeBlock/CodeBlock";
import React, { useState } from "react";
import { toJsPath, toPythonPath } from "../../utils/convert";

interface Props {
  json: string;
}

const JsonViewer = ({ json }: Props) => {
  const [selectedPath, setSelectedPath] = useState("");
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [truncateLongStrings, setTruncateLongStrings] = useState(false);

  // 折り畳み状態をトグルする関数
  const toggleCollapse = (path: string) => {
    setCollapsedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  // 選択されたパスの値を取得する関数
  const getSelectedValue = (path: string) => {
    try {
      const pathParts = path.split("/").filter((part) => part !== "");
      let current = JSON.parse(json);

      for (const part of pathParts) {
        if (current && typeof current === "object") {
          current = current[part];
        } else {
          return null;
        }
      }

      return current;
    } catch (error) {
      return null;
    }
  };

  // 長い文字列を短縮表示する関数
  const truncateString = (value: any): string => {
    if (typeof value !== "string") {
      return JSON.stringify(value);
    }

    if (!truncateLongStrings || value.length <= 100) {
      return value;
    }

    // 100文字以上の場合は短縮表示
    const truncated =
      value.substring(0, 50) + "..." + value.substring(value.length - 50);
    return `[長い文字列 ${value.length}文字] ${truncated}`;
  };

  // JSONオブジェクトをHTMLに変換する関数
  const renderJson = (obj: any, parentPath = "") => {
    return Object.entries(obj).map(([key, value], index) => {
      const path = `${parentPath}/${key}`;
      const isCollapsed = collapsedPaths.has(path);

      if (typeof value === "object" && value !== null) {
        const isArray = Array.isArray(value);
        const objectType = isArray
          ? `[${value.length}]`
          : `{${Object.keys(value).length}}`;

        return (
          <div key={path} className="mb-1">
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 px-1 py-0.5 rounded"
              onClick={() => toggleCollapse(path)}
            >
              <span className="mr-1 text-gray-600">
                {isCollapsed ? "▶" : "▼"}
              </span>
              <span
                className="font-medium text-blue-600"
                onDoubleClick={() => setSelectedPath(path)}
              >
                {key}:
              </span>
              <span className="ml-2 text-gray-500 text-xs">
                {isCollapsed ? objectType : ""}
              </span>
            </div>
            {!isCollapsed && (
              <div style={{ marginLeft: "20px" }}>
                {renderJson(value, path)}
              </div>
            )}
          </div>
        );
      }
      return (
        <div key={path} className="mb-1">
          <div className="flex items-center px-1 py-0.5">
            <span className="mr-4 text-gray-400">•</span>
            <span
              className="font-medium text-green-600"
              onDoubleClick={() => setSelectedPath(path)}
            >
              {key}:
            </span>
            <span
              className="ml-2 text-gray-700"
              onDoubleClick={() => setSelectedPath(path)}
            >
              {truncateString(value)}
            </span>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      {/* 長い文字列短縮表示のトグルボタン */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setTruncateLongStrings(!truncateLongStrings)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            truncateLongStrings
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {truncateLongStrings ? "長い文字列を展開" : "長い文字列を短縮"}
        </button>
      </div>

      {selectedPath && (
        <div className="w-full mx-auto mb-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <div className="mb-2">
                Selected Path (JavaScript): <br />
                <CodeBlock codeString={toJsPath(selectedPath)} />
              </div>
              <div>
                Selected Path (Python): <br />
                <CodeBlock codeString={toPythonPath(selectedPath)} />
              </div>
            </div>
            <div className="flex-1">
              Selected Value: <br />
              <CodeBlock
                codeString={JSON.stringify(
                  getSelectedValue(selectedPath),
                  null,
                  2
                )}
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between w-full">
        <div className="max-h-screen overflow-auto px-4 py-2 border rounded-lg border-black bg-white">
          <div className="text-xs font-mono">
            {renderJson(JSON.parse(json))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;
