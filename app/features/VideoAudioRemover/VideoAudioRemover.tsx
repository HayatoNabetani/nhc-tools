import { useCallback, useEffect, useRef, useState } from "react";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

// ffmpeg.wasm本体(約31MB)は初回実行時のみCDNから読み込む
const FFMPEG_CORE_BASE =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd";

// 入力の拡張子ごとの出力MIMEタイプ。音声トラックを捨てるだけなので
// コンテナは入力と同じものを使い、映像は無劣化コピーする
const CONTAINER_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

type Status = "idle" | "processing" | "done" | "error";

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
};

const VideoAudioRemover = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [progressText, setProgressText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [originalSize, setOriginalSize] = useState(0);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [resultFileName, setResultFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  // アンマウント時に確実にオブジェクトURLを解放するための最新値参照
  const urlsRef = useRef({ original: "", result: "" });

  useEffect(() => {
    urlsRef.current = { original: originalUrl, result: resultUrl };
  }, [originalUrl, resultUrl]);

  // アンマウント時にワーカーとオブジェクトURLを解放
  useEffect(() => {
    return () => {
      ffmpegRef.current?.terminate();
      const { original, result } = urlsRef.current;
      if (original) URL.revokeObjectURL(original);
      if (result) URL.revokeObjectURL(result);
    };
  }, []);

  // FFmpegを初回のみロードして使い回す
  const loadFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;

    setProgressText(
      "FFmpegを読み込み中...（初回のみ、約31MBのダウンロードに少し時間がかかります）"
    );
    const [{ FFmpeg }, { toBlobURL }] = await Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]);
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(
        `${FFMPEG_CORE_BASE}/ffmpeg-core.js`,
        "text/javascript"
      ),
      wasmURL: await toBlobURL(
        `${FFMPEG_CORE_BASE}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("video/") && !/\.(mp4|m4v|mov|webm|mkv)$/i.test(file.name)) {
        setErrorMessage("動画ファイルを選択してください");
        setStatus("error");
        return;
      }

      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);

      setOriginalUrl(URL.createObjectURL(file));
      setOriginalSize(file.size);
      setResultUrl("");
      setResultSize(0);
      setErrorMessage("");
      setStatus("processing");

      const baseName = file.name.replace(/\.[^.]+$/, "") || "video";
      const ext =
        file.name.match(/\.([^.]+)$/)?.[1]?.toLowerCase() ?? "mp4";
      const inputName = `input.${ext}`;
      const outputName = `output.${ext}`;

      let ffmpeg: FFmpeg;
      try {
        ffmpeg = await loadFFmpeg();
      } catch (error) {
        console.error("FFmpegロードエラー:", error);
        setErrorMessage(
          "FFmpegの読み込みに失敗しました。ネットワーク接続を確認してページを再読み込みしてください。"
        );
        setStatus("error");
        return;
      }

      try {
        setProgressText("動画を読み込み中...");
        await ffmpeg.writeFile(
          inputName,
          new Uint8Array(await file.arrayBuffer())
        );

        setProgressText("音声トラックを除去中...");
        // -an で音声を落とし、映像はコピーするだけなので再エンコードなし（無劣化・高速）
        const code = await ffmpeg.exec([
          "-i",
          inputName,
          "-an",
          "-c:v",
          "copy",
          outputName,
        ]);
        if (code !== 0) {
          throw new Error(`ffmpeg exited with code ${code}`);
        }

        const data = await ffmpeg.readFile(outputName);
        if (typeof data === "string" || data.length === 0) {
          throw new Error("empty output");
        }
        const blob = new Blob([data.buffer as ArrayBuffer], {
          type: CONTAINER_MIME[ext] ?? "video/mp4",
        });
        setResultUrl(URL.createObjectURL(blob));
        setResultSize(blob.size);
        setResultFileName(`${baseName}_muted.${ext}`);
        setStatus("done");
      } catch (error) {
        console.error("音声除去エラー:", error);
        setErrorMessage(
          "音声の除去に失敗しました。対応していない形式の可能性があります（MP4 / MOV / WebM / MKV でお試しください）。"
        );
        setStatus("error");
      } finally {
        // wasm内のメモリファイルシステムを掃除する
        await ffmpeg.deleteFile(inputName).catch(() => {});
        await ffmpeg.deleteFile(outputName).catch(() => {});
      }
    },
    [originalUrl, resultUrl, loadFFmpeg]
  );

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
          動画を選択して音声トラックを除去（無劣化・再エンコードなし）
        </p>
        <p className="text-sm text-gray-500">
          タップ/クリックで選択、ドラッグ&ドロップに対応。MP4 / MOV / WebM /
          MKVなど。動画は端末内で処理され、どこにも送信されません。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mkv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />
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
              元の動画（{formatSize(originalSize)}）
            </p>
            <video
              src={originalUrl}
              controls
              className="w-full max-h-[50vh] rounded-lg border border-gray-300 bg-black"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">
              音声除去後
              {resultSize > 0 && `（${formatSize(resultSize)}）`}
            </p>
            {resultUrl ? (
              <video
                src={resultUrl}
                controls
                className="w-full max-h-[50vh] rounded-lg border border-gray-300 bg-black"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400 border border-gray-300 rounded-lg bg-gray-50">
                {status === "processing" ? "処理中..." : "ここに結果を表示"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* アクション */}
      {status === "done" && resultUrl && (
        <a
          href={resultUrl}
          download={resultFileName}
          className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800"
        >
          音声なし動画をダウンロード
        </a>
      )}
    </div>
  );
};

export default VideoAudioRemover;
