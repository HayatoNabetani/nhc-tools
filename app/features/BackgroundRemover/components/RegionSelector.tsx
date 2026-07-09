import { useCallback, useEffect, useRef, useState } from "react";

type SelectionMode = "rect" | "lasso";

interface Point {
  x: number;
  y: number;
}

interface Props {
  imageUrl: string;
  disabled?: boolean;
  onExtract: (blob: Blob, useAi: boolean) => void;
}

/**
 * 画像の上でドラッグ（タッチ対応）して範囲を指定するセレクタ
 * 矩形: そのままの矩形で切り出し
 * なげなわ: フリーハンドの輪郭で切り出し（外側は透明になる）
 */
const RegionSelector = ({ imageUrl, disabled = false, onExtract }: Props) => {
  const [mode, setMode] = useState<SelectionMode>("rect");
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasSelection =
    !isDrawing &&
    (mode === "rect"
      ? points.length >= 2 &&
        Math.abs(points[points.length - 1].x - points[0].x) > 4 &&
        Math.abs(points[points.length - 1].y - points[0].y) > 4
      : points.length >= 3);

  // 表示サイズに合わせてオーバーレイのキャンバスサイズを同期する
  const syncCanvasSize = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    setPoints([]);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", syncCanvasSize);
    return () => window.removeEventListener("resize", syncCanvasSize);
  }, [syncCanvasSize]);

  // 選択範囲のパスを描く共通処理
  const traceSelectionPath = useCallback(
    (ctx: CanvasRenderingContext2D, pts: Point[]) => {
      ctx.beginPath();
      if (mode === "rect") {
        const start = pts[0];
        const end = pts[pts.length - 1];
        ctx.rect(
          Math.min(start.x, end.x),
          Math.min(start.y, end.y),
          Math.abs(end.x - start.x),
          Math.abs(end.y - start.y)
        );
      } else {
        ctx.moveTo(pts[0].x, pts[0].y);
        pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.closePath();
      }
    },
    [mode]
  );

  // 選択状態をオーバーレイに描画する
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (points.length < 2) return;

    // 選択範囲の外側を薄暗くする
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    traceSelectionPath(ctx, points);
    ctx.fill();
    ctx.restore();

    // 輪郭線
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    traceSelectionPath(ctx, points);
    ctx.stroke();
  }, [points, traceSelectionPath]);

  const getPos = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const pos = getPos(e);
    setPoints(mode === "rect" ? [pos, pos] : [pos]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || disabled) return;
    const pos = getPos(e);
    setPoints((prev) => {
      if (mode === "rect") {
        return [prev[0], pos];
      }
      // なげなわは点を間引きながら追加
      const last = prev[prev.length - 1];
      if (Math.hypot(pos.x - last.x, pos.y - last.y) < 3) return prev;
      return [...prev, pos];
    });
  };

  const handlePointerUp = () => setIsDrawing(false);

  // 選択範囲を元解像度で切り出してBlobにする
  const handleExtract = async (useAi: boolean) => {
    const img = imgRef.current;
    if (!img || !hasSelection) return;

    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    const naturalPoints = points.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const xs = naturalPoints.map((p) => p.x);
    const ys = naturalPoints.map((p) => p.y);
    const minX = Math.max(0, Math.min(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxX = Math.min(img.naturalWidth, Math.max(...xs));
    const maxY = Math.min(img.naturalHeight, Math.max(...ys));
    const width = Math.round(maxX - minX);
    const height = Math.round(maxY - minY);
    if (width < 2 || height < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (mode === "lasso") {
      ctx.beginPath();
      ctx.moveTo(naturalPoints[0].x - minX, naturalPoints[0].y - minY);
      naturalPoints
        .slice(1)
        .forEach((p) => ctx.lineTo(p.x - minX, p.y - minY));
      ctx.closePath();
      ctx.clip();
    }
    ctx.drawImage(img, -minX, -minY);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (blob) {
      onExtract(blob, useAi);
      setPoints([]);
    }
  };

  const switchMode = (newMode: SelectionMode) => {
    setMode(newMode);
    setPoints([]);
  };

  const modeButtonClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
      active
        ? "bg-blue-500 text-white"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`;

  return (
    <div>
      {/* 画像 + 選択オーバーレイ */}
      {/* 座標ずれを防ぐため、img要素は表示画像とぴったり同じサイズにする */}
      <div className="relative inline-block border border-gray-300 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="元画像"
          className="block max-w-full max-h-[60vh] select-none"
          draggable={false}
          onLoad={syncCanvasSize}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>

      {/* 選択モード切り替え（画像の下に置いて左右の画像の高さを揃える） */}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => switchMode("rect")}
          className={modeButtonClass(mode === "rect")}
        >
          矩形選択
        </button>
        <button
          type="button"
          onClick={() => switchMode("lasso")}
          className={modeButtonClass(mode === "lasso")}
        >
          なげなわ選択
        </button>
        <span className="text-xs text-gray-500">
          画像の上をドラッグ/なぞって範囲指定
        </span>
      </div>

      {/* 選択範囲へのアクション */}
      {hasSelection && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleExtract(false)}
            className="py-2 px-3 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
          >
            この範囲をそのまま切り出す
          </button>
          <button
            type="button"
            onClick={() => handleExtract(true)}
            disabled={disabled}
            className="py-2 px-3 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            この範囲だけAIで切り抜く
          </button>
          <button
            type="button"
            onClick={() => setPoints([])}
            className="py-2 px-3 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
          >
            選択解除
          </button>
        </div>
      )}
    </div>
  );
};

export default RegionSelector;
