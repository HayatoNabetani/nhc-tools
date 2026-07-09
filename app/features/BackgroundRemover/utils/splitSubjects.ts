// 被写体の本体とみなす不透明度のしきい値
const CORE_ALPHA_THRESHOLD = 40;
// アンチエイリアスの淡い縁を取りこぼさないための最小結合距離
const MIN_RADIUS = 3;

export interface SplitOptions {
  /** 最大分割数（面積の大きい順） */
  maxParts?: number;
  /** この距離(px)以内にあるパーツを同じ被写体としてまとめる */
  mergeDistance?: number;
}

/**
 * 背景透過画像のアルファチャンネルを連結成分解析して、
 * 繋がっていない被写体ごとに個別の透過PNGへ分割する。
 * mergeDistanceを指定すると、その距離以内で近接しているパーツ
 * （くしの歯のような分離した線）を1つの被写体として扱う。
 * @param source 背景透過済みのPNG Blob
 * @returns 被写体ごとのPNG Blob（面積の大きい順）。分割できなければ要素1つ
 */
export const splitSubjects = async (
  source: Blob,
  { maxParts = 8, mergeDistance = 10 }: SplitOptions = {}
): Promise<Blob[]> => {
  const bitmap = await createImageBitmap(source);
  const { width, height } = bitmap;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvasが利用できません");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, width, height);
  const pixelCount = width * height;
  // 結合距離の半分ずつ両側から膨張して繋げる
  const radius = Math.max(MIN_RADIUS, Math.ceil(mergeDistance / 2));

  // 1. 全ての本体ピクセルを起点にした多点BFSで、周囲radius px以内を被写体圏に含める
  const distance = new Int32Array(pixelCount).fill(-1);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < pixelCount; i++) {
    if (data[i * 4 + 3] >= CORE_ALPHA_THRESHOLD) {
      distance[i] = 0;
      queue[tail++] = i;
    }
  }
  if (tail === 0) return [];

  while (head < tail) {
    const index = queue[head++];
    const d = distance[index];
    if (d >= radius) continue;
    const x = index % width;
    const y = (index / width) | 0;
    if (x > 0 && distance[index - 1] < 0) {
      distance[index - 1] = d + 1;
      queue[tail++] = index - 1;
    }
    if (x < width - 1 && distance[index + 1] < 0) {
      distance[index + 1] = d + 1;
      queue[tail++] = index + 1;
    }
    if (y > 0 && distance[index - width] < 0) {
      distance[index - width] = d + 1;
      queue[tail++] = index - width;
    }
    if (y < height - 1 && distance[index + width] < 0) {
      distance[index + width] = d + 1;
      queue[tail++] = index + width;
    }
  }

  // 2. 膨張後の被写体圏（distance >= 0）で連結成分にラベルを付ける
  const labels = new Int32Array(pixelCount);
  const componentSizes: number[] = [];
  const boundingBoxes: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }[] = [];

  for (let start = 0; start < pixelCount; start++) {
    if (labels[start] !== 0 || distance[start] < 0) continue;

    const label = componentSizes.length + 1;
    let bfsHead = 0;
    let bfsTail = 0;
    queue[bfsTail++] = start;
    labels[start] = label;
    // sizeとbboxは実際に描画されるピクセル(alpha > 0)だけで数える
    let size = 0;
    const box = { minX: width, minY: height, maxX: 0, maxY: 0 };

    const visit = (neighbor: number) => {
      if (labels[neighbor] === 0 && distance[neighbor] >= 0) {
        labels[neighbor] = label;
        queue[bfsTail++] = neighbor;
      }
    };

    while (bfsHead < bfsTail) {
      const index = queue[bfsHead++];
      const x = index % width;
      const y = (index / width) | 0;
      if (data[index * 4 + 3] > 0) {
        size++;
        if (x < box.minX) box.minX = x;
        if (x > box.maxX) box.maxX = x;
        if (y < box.minY) box.minY = y;
        if (y > box.maxY) box.maxY = y;
      }
      if (x > 0) visit(index - 1);
      if (x < width - 1) visit(index + 1);
      if (y > 0) visit(index - width);
      if (y < height - 1) visit(index + width);
    }

    componentSizes.push(size);
    boundingBoxes.push(box);
  }

  // 3. ノイズ除去: 小さすぎる成分は捨て、面積の大きい順に採用
  const totalForeground = componentSizes.reduce((sum, s) => sum + s, 0);
  const minPixels = Math.max(400, totalForeground * 0.01);
  const keptLabels = componentSizes
    .map((size, i) => ({ label: i + 1, size }))
    .filter(({ size }) => size >= minPixels)
    .sort((a, b) => b.size - a.size)
    .slice(0, maxParts);

  if (keptLabels.length <= 1) {
    // 分割できるものがない場合は元をそのまま1つとして返す
    return [source];
  }

  // 4. 成分ごとにバウンディングボックスで切り出してPNG化する
  const blobs: Blob[] = [];
  for (const { label } of keptLabels) {
    const box = boundingBoxes[label - 1];
    const partWidth = box.maxX - box.minX + 1;
    const partHeight = box.maxY - box.minY + 1;
    if (partWidth <= 0 || partHeight <= 0) continue;

    const partCanvas = document.createElement("canvas");
    partCanvas.width = partWidth;
    partCanvas.height = partHeight;
    const partCtx = partCanvas.getContext("2d");
    if (!partCtx) continue;

    const partImage = partCtx.createImageData(partWidth, partHeight);
    for (let y = 0; y < partHeight; y++) {
      for (let x = 0; x < partWidth; x++) {
        const sourceIndex = (box.minY + y) * width + (box.minX + x);
        if (labels[sourceIndex] !== label) continue;
        const src = sourceIndex * 4;
        if (data[src + 3] === 0) continue;
        const dst = (y * partWidth + x) * 4;
        partImage.data[dst] = data[src];
        partImage.data[dst + 1] = data[src + 1];
        partImage.data[dst + 2] = data[src + 2];
        partImage.data[dst + 3] = data[src + 3];
      }
    }
    partCtx.putImageData(partImage, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      partCanvas.toBlob(resolve, "image/png")
    );
    if (blob) blobs.push(blob);
  }

  return blobs;
};
