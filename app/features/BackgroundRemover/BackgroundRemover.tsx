import { useCallback, useEffect, useRef, useState } from "react";
import RegionSelector from "./components/RegionSelector";
import { splitSubjects } from "./utils/splitSubjects";

interface SubjectPart {
  url: string;
  blob: Blob;
}

type Status = "idle" | "processing" | "done" | "error";

// onnxruntime-webがwebpackでバンドルできないため、
// ライブラリは実行時にブラウザのネイティブimport()でCDNから読み込む
const BACKGROUND_REMOVAL_CDN =
  "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";

type BackgroundRemovalModule = typeof import("@imgly/background-removal");
type RemovalConfig = NonNullable<
  Parameters<BackgroundRemovalModule["removeBackground"]>[1]
>;

const loadBackgroundRemoval = (): Promise<BackgroundRemovalModule> =>
  import(/* webpackIgnore: true */ BACKGROUND_REMOVAL_CDN);

// 透過部分を市松模様で見せるための背景
const CHECKER_BG =
  "[background-image:repeating-conic-gradient(#e5e7eb_0%_25%,#ffffff_0%_50%)] [background-size:20px_20px]";

const BackgroundRemover = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parts, setParts] = useState<SubjectPart[]>([]);
  const [splitting, setSplitting] = useState(false);
  const [splitMessage, setSplitMessage] = useState("");
  const [copiedPartIndex, setCopiedPartIndex] = useState(-1);
  const [highQuality, setHighQuality] = useState(false);
  const [mergeDistance, setMergeDistance] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 高精度モード切り替え時に再処理できるよう、直近の入力画像を保持する
  const lastInputRef = useRef<Blob | null>(null);
  // 現在の結果に対して分割を実行済みか（結合距離変更時の自動再分割に使う）
  const hasSplitRef = useRef(false);

  // 分割結果をクリアしてオブジェクトURLを解放する
  const clearParts = useCallback(() => {
    setParts((prev) => {
      prev.forEach((part) => URL.revokeObjectURL(part.url));
      return [];
    });
    setSplitMessage("");
    setCopiedPartIndex(-1);
    hasSplitRef.current = false;
  }, []);

  const processFile = useCallback(
    async (file: Blob, useHighQuality: boolean = highQuality) => {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("画像ファイルを選択してください");
        setStatus("error");
        return;
      }

      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);

      lastInputRef.current = file;
      setOriginalUrl(URL.createObjectURL(file));
      setResultUrl("");
      setResultBlob(null);
      setCopied(false);
      setErrorMessage("");
      clearParts();
      setStatus("processing");
      setProgressText("準備中...");

      try {
        // ライブラリ(数MB)は初回実行時のみ読み込む
        const { removeBackground } = await loadBackgroundRemoval();

        const baseConfig: RemovalConfig = {
          progress: (key, current, total) => {
            if (key.startsWith("fetch")) {
              const percent =
                total > 0 ? Math.round((current / total) * 100) : 0;
              setProgressText(
                `モデルをダウンロード中... ${percent}%（モデルごとに初回のみ）`
              );
            } else {
              setProgressText(
                useHighQuality
                  ? "被写体を切り抜き中...（高精度モード）"
                  : "被写体を切り抜き中..."
              );
            }
          },
        };

        let blob: Blob;
        if (useHighQuality) {
          // フル精度モデルを使用し、WebGPUが使えるならGPUで推論する
          const useGpu = "gpu" in navigator;
          try {
            blob = await removeBackground(file, {
              ...baseConfig,
              model: "isnet",
              ...(useGpu ? { device: "gpu" as const } : {}),
            });
          } catch (gpuError) {
            if (!useGpu) throw gpuError;
            console.warn("GPU推論に失敗、CPUで再試行:", gpuError);
            blob = await removeBackground(file, {
              ...baseConfig,
              model: "isnet",
            });
          }
        } else {
          blob = await removeBackground(file, baseConfig);
        }

        setResultBlob(blob);
        setResultUrl(URL.createObjectURL(blob));
        setStatus("done");
      } catch (error) {
        console.error("背景除去エラー:", error);
        setErrorMessage(
          "切り抜きに失敗しました。別の画像で試すか、ページを再読み込みしてください。"
        );
        setStatus("error");
      }
    },
    [originalUrl, resultUrl, clearParts, highQuality]
  );

  // 高精度モードの切り替え。画像を読み込み済みなら新しい設定で自動再処理する
  const toggleHighQuality = () => {
    const next = !highQuality;
    setHighQuality(next);
    if (lastInputRef.current && status !== "processing") {
      processFile(lastInputRef.current, next);
    }
  };

  // クリップボードからの貼り付けにも対応
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.items ?? [])
        .find((item) => item.type.startsWith("image/"))
        ?.getAsFile();
      if (file) processFile(file);
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [processFile]);

  // アンマウント時にオブジェクトURLを解放
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 範囲選択からの切り出し結果を受け取る
  const handleRegionExtract = (blob: Blob, useAi: boolean) => {
    if (useAi) {
      // 選択範囲だけをAIで切り抜く
      processFile(blob);
      return;
    }
    // そのまま結果として表示する
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultBlob(blob);
    setResultUrl(URL.createObjectURL(blob));
    setErrorMessage("");
    setCopied(false);
    clearParts();
    setStatus("done");
  };

  // 切り抜き結果を繋がっていない被写体ごとに分割する
  const handleSplit = useCallback(async () => {
    if (!resultBlob) return;
    setSplitting(true);
    setSplitMessage("");
    try {
      const blobs = await splitSubjects(resultBlob, { mergeDistance });
      if (blobs.length <= 1) {
        clearParts();
        setSplitMessage(
          "分割できる被写体が見つかりませんでした（全体が1つに繋がっています）。結合距離を小さくすると分かれることがあります。"
        );
      } else {
        setParts((prev) => {
          prev.forEach((part) => URL.revokeObjectURL(part.url));
          return blobs.map((blob) => ({
            blob,
            url: URL.createObjectURL(blob),
          }));
        });
      }
    } catch (error) {
      console.error("被写体分割エラー:", error);
      setSplitMessage("分割に失敗しました。");
    }
    hasSplitRef.current = true;
    setSplitting(false);
  }, [resultBlob, mergeDistance, clearParts]);

  // 分割済みの状態で結合距離を変えたら、少し待ってから自動で再分割する
  useEffect(() => {
    if (!hasSplitRef.current) return;
    const timer = setTimeout(() => handleSplit(), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeDistance]);

  const handleCopyPart = async (part: SubjectPart, index: number) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": part.blob }),
      ]);
      setCopiedPartIndex(index);
      setTimeout(() => setCopiedPartIndex(-1), 2000);
    } catch (error) {
      console.error("コピーエラー:", error);
      setSplitMessage(
        "クリップボードへのコピーに失敗しました。ダウンロードをご利用ください。"
      );
    }
  };

  const handleCopy = async () => {
    if (!resultBlob) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": resultBlob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("コピーエラー:", error);
      setErrorMessage(
        "クリップボードへのコピーに失敗しました。ダウンロードをご利用ください。"
      );
    }
  };

  return (
    <div className="w-full">
      {/* アップロードエリア */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
        className={`mb-6 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
      >
        <p className="font-medium text-gray-700 mb-1">
          画像を選択して被写体を切り抜き（背景透過PNG）
        </p>
        <p className="text-sm text-gray-500">
          タップ/クリックで選択、ドラッグ&ドロップ、貼り付け(Ctrl+V)に対応。
          画像は端末内で処理され、どこにも送信されません。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* 高精度モードトグル */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={highQuality}
          onClick={toggleHighQuality}
          disabled={status === "processing"}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            highQuality ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              highQuality ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <div>
          <span className="text-sm font-medium text-gray-700">
            高精度モード
          </span>
          <p className="text-xs text-gray-500">
            フル精度モデル(+WebGPU対応環境ではGPU)で処理します。精度が上がる分、モデルのダウンロードと処理に時間がかかります。切り替えると自動で再処理します。
          </p>
        </div>
      </div>

      {/* 状態表示 */}
      {status === "processing" && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-blue-800">{progressText}</span>
        </div>
      )}
      {status === "error" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {/* プレビュー */}
      {originalUrl && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              元画像（範囲を指定して手動切り出しも可能）
            </p>
            <RegionSelector
              imageUrl={originalUrl}
              disabled={status === "processing"}
              onExtract={handleRegionExtract}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              切り抜き結果（背景透過）
            </p>
            <div
              className={`border border-gray-300 rounded-lg overflow-hidden ${CHECKER_BG}`}
            >
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="切り抜き結果"
                  className="w-full object-contain max-h-[60vh]"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-white/70">
                  {status === "processing" ? "処理中..." : "ここに結果を表示"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* アクション */}
      {status === "done" && resultUrl && (
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={resultUrl}
            download="cutout.png"
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
          >
            透過PNGをダウンロード
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            {copied ? "コピーしました!" : "クリップボードにコピー"}
          </button>
          <button
            type="button"
            onClick={handleSplit}
            disabled={splitting}
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {splitting ? "分割中..." : "被写体ごとに分割"}
          </button>
          <div className="flex items-center gap-2">
            <label
              htmlFor="mergeDistance"
              className="text-xs text-gray-600 whitespace-nowrap"
              title="この距離(px)以内で近接しているパーツを同じ被写体としてまとめます。くしの歯のような細かい線がバラバラになるときは大きくしてください。"
            >
              結合距離: {mergeDistance}px
            </label>
            <input
              id="mergeDistance"
              type="range"
              min={0}
              max={60}
              step={2}
              value={mergeDistance}
              onChange={(e) => setMergeDistance(Number(e.target.value))}
              className="w-36 accent-purple-600"
            />
          </div>
        </div>
      )}

      {/* 分割メッセージ */}
      {splitMessage && (
        <p className="mt-3 text-sm text-gray-600">{splitMessage}</p>
      )}

      {/* 分割結果 */}
      {parts.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium text-gray-700">
            分割結果（{parts.length}個の被写体）
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {parts.map((part, index) => (
              <div
                key={part.url}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <div className={`${CHECKER_BG} p-2`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={part.url}
                    alt={`被写体 ${index + 1}`}
                    className="w-full object-contain max-h-64"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border-t border-gray-200">
                  <a
                    href={part.url}
                    download={`cutout-${index + 1}.png`}
                    className="py-1.5 px-3 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
                  >
                    ダウンロード
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyPart(part, index)}
                    className="py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    {copiedPartIndex === index ? "コピーしました!" : "コピー"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;
