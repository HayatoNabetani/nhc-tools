/**
 * Google Maps の place URL から、埋め込まれた写真の画像URL
 * (lh3.googleusercontent.com/...) をデコードで抜き出す。ネットワーク通信は不要。
 *
 * place URL には `!6s<URLエンコードされた画像URL>` の形で写真URLが埋め込まれている。
 * これを取り出してデコードするだけで画像URLが得られる。
 */
export const extractPhotoUrls = (mapUrl: string): string[] => {
  const results: string[] = [];
  // !6s の後ろから、次の ! または & または末尾までが画像URL
  const re = /!6s(https[^!&]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(mapUrl)) !== null) {
    try {
      results.push(decodeURIComponent(match[1]));
    } catch {
      // 不正なエスケープが含まれる場合はそのまま採用する
      results.push(match[1]);
    }
  }
  // 重複を除去
  return Array.from(new Set(results));
};

/**
 * lh3 画像URLの解像度指定 (末尾の =w..-h.. など) を差し替える。
 * @param size 例: "w1600" / "s0" / "w1080-h1349-k-no"。空文字なら元のまま。
 */
export const applyPhotoSize = (imgUrl: string, size: string): string => {
  if (!size) return imgUrl;
  // 最初の = より前がベースURL。そこにサイズ指定を付け直す
  const base = imgUrl.split("=")[0];
  return `${base}=${size}`;
};

/**
 * place URL から店舗・場所の名前を取り出す（ダウンロード時のファイル名などに使う）。
 */
export const extractPlaceName = (mapUrl: string): string => {
  const match = mapUrl.match(/\/place\/([^/@]+)/);
  if (!match) return "";
  try {
    return decodeURIComponent(match[1]).replace(/\+/g, " ").trim();
  } catch {
    return match[1].replace(/\+/g, " ").trim();
  }
};

/**
 * ファイル名に使えない文字を除去する。
 */
export const sanitizeFileName = (name: string): string =>
  name.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
