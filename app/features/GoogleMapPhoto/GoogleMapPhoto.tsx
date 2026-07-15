import ButtonOnlyIcon from "@/components/elements/Button/ButtonOnlyIcon";
import { useMemo, useState } from "react";
import {
  applyPhotoSize,
  extractPhotoUrls,
  extractPlaceName,
  sanitizeFileName,
} from "./utils/extract";

const SIZE_PRESETS = [
  { label: "そのまま", value: "" },
  { label: "標準 (幅800)", value: "w800" },
  { label: "大 (幅1600)", value: "w1600" },
  { label: "特大 (幅4000)", value: "w4000" },
  { label: "原寸", value: "s0" },
];

const GoogleMapPhoto = () => {
  const [mapUrl, setMapUrl] = useState("");
  const [size, setSize] = useState("w4000");
  const [downloadingIndex, setDownloadingIndex] = useState(-1);

  const placeName = useMemo(() => extractPlaceName(mapUrl), [mapUrl]);
  const photos = useMemo(() => extractPhotoUrls(mapUrl), [mapUrl]);

  // 選択中のサイズを反映した表示・DL用のURL一覧
  const sizedPhotos = useMemo(
    () => photos.map((url) => applyPhotoSize(url, size)),
    [photos, size]
  );

  const handleDownload = async (url: string, index: number) => {
    setDownloadingIndex(index);
    const baseName = sanitizeFileName(placeName || "gmap-photo");
    const fileName =
      photos.length > 1 ? `${baseName}-${index + 1}.jpg` : `${baseName}.jpg`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      const blob = await resp.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch (error) {
      console.error("ダウンロードに失敗、新規タブで開きます:", error);
      // CORS等で失敗した場合は新規タブで開く（右クリック保存できる）
      window.open(url, "_blank", "noopener");
    }
    setDownloadingIndex(-1);
  };

  const hasInput = mapUrl.trim().length > 0;

  return (
    <div className="w-full">
      {/* 入力 */}
      <div className="mb-6">
        <label
          htmlFor="mapUrl"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Google Maps の場所URLを貼り付け
        </label>
        <textarea
          id="mapUrl"
          rows={3}
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://www.google.com/maps/place/..."
          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 break-all"
        />
        <p className="mt-2 text-xs text-gray-500">
          URLに埋め込まれた画像URLをデコードして取り出します（サーバー通信なし）。
          スマホの短縮URL（maps.app.goo.gl）は画像が埋め込まれていないため、
          PCのアドレスバーに表示される長いURLを使ってください。
        </p>
      </div>

      {/* サイズ選択 */}
      {photos.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-700">
            解像度
            {placeName && (
              <span className="ml-2 font-normal text-gray-500">
                （{placeName}）
              </span>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {SIZE_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setSize(preset.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  size === preset.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="カスタム (例: w1080-h1349-k-no)"
              className="px-3 py-1 text-xs border border-gray-300 rounded-md bg-white w-56 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* 抽出結果 */}
      {hasInput && photos.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          画像URLが見つかりませんでした。写真が埋め込まれた場所URL（
          <span className="font-mono">!6s</span>
          を含むもの）か確認してください。
        </div>
      )}

      {photos.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">
            抽出結果（{photos.length}枚）
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sizedPhotos.map((url, index) => (
              <div
                key={photos[index]}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-100 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`${placeName || "Google Maps"} の写真 ${index + 1}`}
                    className="w-full object-contain max-h-[60vh]"
                  />
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleDownload(url, index)}
                    disabled={downloadingIndex === index}
                    className="py-1.5 px-3 text-xs font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                  >
                    {downloadingIndex === index
                      ? "ダウンロード中..."
                      : "ダウンロード"}
                  </button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    新規タブで開く
                  </a>
                  <span className="text-xs text-gray-500">画像URLをコピー</span>
                  <ButtonOnlyIcon type="copy" value={url} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapPhoto;
