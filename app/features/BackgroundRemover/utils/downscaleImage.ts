/**
 * 大きすぎる画像を推論前に縮小する。
 * スマホ写真(4000x3000等)をそのままAIに渡すと処理時間が長く、
 * モバイル端末ではメモリ不足でハングすることがあるため、長辺を上限に収める。
 * @param source 入力画像
 * @param maxDim 長辺の最大ピクセル数
 * @returns 縮小した画像（上限以下ならそのまま元を返す）
 */
export const downscaleImage = async (
  source: Blob,
  maxDim = 2048
): Promise<Blob> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source);
  } catch {
    // デコードできない場合はそのまま渡す
    return source;
  }

  const { width, height } = bitmap;
  const longest = Math.max(width, height);
  if (longest <= maxDim) {
    bitmap.close();
    return source;
  }

  const scale = maxDim / longest;
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return source;
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // 透過を保持する必要があるPNGはPNGのまま、それ以外はJPEGで軽く出力する
  const type = source.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = type === "image/jpeg" ? 0.95 : undefined;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, quality)
  );
  return blob ?? source;
};
