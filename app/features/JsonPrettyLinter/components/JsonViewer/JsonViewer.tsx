import CodeBlock from "@/components/elements/CodeBlock/CodeBlock";
import { useMemo, useRef, useState } from "react";
import { toJsPath, toPythonPath } from "../../utils/convert";

interface Props {
  json: string;
}

interface Selection {
  path: string;
  // ツリーコンテナのコンテンツ座標系でのポップオーバー表示位置
  x: number;
  y: number;
}

const POPOVER_WIDTH = 384; // w-96

const JsonViewer = ({ json }: Props) => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [truncateLongStrings, setTruncateLongStrings] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // JSONのパースはjsonが変わったときだけ行う
  const parsedJson = useMemo(() => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

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

  // ダブルクリックした位置の近くにポップオーバーを表示する
  const handleSelect = (path: string, e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    // コンテナ内スクロールを考慮したコンテンツ座標へ変換
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const clickY = e.clientY - rect.top + container.scrollTop;

    // 右端にはみ出す場合は左へ寄せる
    const maxX = container.scrollLeft + container.clientWidth - POPOVER_WIDTH - 8;
    setSelection({
      path,
      x: Math.max(8, Math.min(clickX, maxX)),
      y: clickY + 20,
    });
  };

  // 選択されたパスの値を取得する関数
  const getSelectedValue = (path: string) => {
    const pathParts = path.split("/").filter((part) => part !== "");
    let current = parsedJson;

    for (const part of pathParts) {
      if (current && typeof current === "object") {
        current = current[part];
      } else {
        return null;
      }
    }

    return current;
  };

  // 長い文字列を短縮表示する関数
  const truncateString = (value: unknown): string => {
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
  const renderJson = (obj: object, parentPath = "") => {
    return Object.entries(obj).map(([key, value]) => {
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
                onDoubleClick={(e) => handleSelect(path, e)}
              >
                {key}:
              </span>
              <span className="ml-2 text-gray-500 text-xs">
                {isCollapsed ? objectType : ""}
              </span>
            </div>
            {!isCollapsed && (
              <div className="ml-5">{renderJson(value, path)}</div>
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
              onDoubleClick={(e) => handleSelect(path, e)}
            >
              {key}:
            </span>
            <span
              className="ml-2 text-gray-700"
              onDoubleClick={(e) => handleSelect(path, e)}
            >
              {truncateString(value)}
            </span>
          </div>
        </div>
      );
    });
  };

  if (parsedJson === null || typeof parsedJson !== "object") {
    return null;
  }

  return (
    <div>
      {/* 操作説明と長い文字列短縮表示のトグルボタン */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          キーや値をダブルクリックすると、その場にパスと値を表示します
        </p>
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

      {/* JSONツリー（ダブルクリック位置にポップオーバー表示） */}
      <div
        ref={containerRef}
        className="relative w-full max-h-screen overflow-auto px-4 py-2 border rounded-lg border-black bg-white"
      >
        <div className="text-xs font-mono">{renderJson(parsedJson)}</div>

        {selection && (
          <div
            className="absolute z-10 w-96 p-4 border border-gray-300 rounded-lg bg-white shadow-xl"
            style={{ left: selection.x, top: selection.y }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">詳細</span>
              <button
                onClick={() => setSelection(null)}
                className="px-2 text-gray-400 hover:text-gray-700 text-lg leading-none"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                Selected Path (JavaScript): <br />
                <CodeBlock codeString={toJsPath(selection.path)} />
              </div>
              <div>
                Selected Path (Python): <br />
                <CodeBlock codeString={toPythonPath(selection.path)} />
              </div>
              <div>
                Selected Value: <br />
                <div className="max-h-64 overflow-auto">
                  <CodeBlock
                    codeString={JSON.stringify(
                      getSelectedValue(selection.path),
                      null,
                      2
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonViewer;
