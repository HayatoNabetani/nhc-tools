export type ToolCategoryId = "code" | "image" | "video" | "time" | "url";

export type ToolIconName =
  | "clock"
  | "braces"
  | "list"
  | "link"
  | "list-tree"
  | "image-minus"
  | "map-pin"
  | "video-off"
  | "database"
  | "code"
  | "image"
  | "video"
  | "globe";

export interface ToolDefinition extends ToolSet {
  category: ToolCategoryId;
  icon: ToolIconName;
  keywords: string[];
}

export const ToolCategories: {
  id: ToolCategoryId;
  label: string;
  icon: ToolIconName;
}[] = [
  { id: "code", label: "プログラミング", icon: "code" },
  { id: "image", label: "画像", icon: "image" },
  { id: "video", label: "動画", icon: "video" },
  { id: "time", label: "時間", icon: "clock" },
  { id: "url", label: "URL・Web", icon: "globe" },
];

export const ToolCatalog: ToolDefinition[] = [
  {
    id: 1,
    title: "日本時間に変換",
    content: "日時文字列・タイムスタンプを日本時間（JST）に変換します。",
    category: "time",
    icon: "clock",
    keywords: ["JST", "UTC", "タイムゾーン", "日時", "timestamp", "ISO"],
  },
  {
    id: 2,
    title: "JSON整形・検証",
    content: "JSONの整形・構文チェック・パス取得に対応しています。",
    category: "code",
    icon: "braces",
    keywords: [
      "json",
      "綺麗に整える",
      "フォーマット",
      "バリデーション",
      "パス",
    ],
  },
  {
    id: 3,
    title: "配列生成",
    content: "テキストから配列・SQLタプルを生成し、重複を確認できます。",
    category: "code",
    icon: "list",
    keywords: ["テキスト", "リスト", "array", "SQL", "タプル", "重複"],
  },
  {
    id: 4,
    title: "URL・クエリ解析",
    content: "クエリパラメータを解析し、必要な項目でURLを生成します。",
    category: "url",
    icon: "link",
    keywords: ["URL", "クエリ", "パラメータ", "query", "Web", "分析"],
  },
  {
    id: 5,
    title: "辞書配列メーカー",
    content: "キーと値からオブジェクトの配列を生成します。",
    category: "code",
    icon: "list-tree",
    keywords: [
      "辞書",
      "配列",
      "オブジェクト",
      "キーバリュー",
      "JSON",
      "データ",
    ],
  },
  {
    id: 6,
    title: "背景透過・切り抜き",
    content: "写真から被写体を切り抜き、透過PNGを生成します。",
    category: "image",
    icon: "image-minus",
    keywords: [
      "画像",
      "写真",
      "背景",
      "透過",
      "背景透過",
      "背景透過切り抜き",
      "切り抜き",
      "PNG",
    ],
  },
  {
    id: 7,
    title: "Googleマップ写真抽出",
    content: "GoogleマップのURLから写真の画像URLを抽出します。",
    category: "image",
    icon: "map-pin",
    keywords: [
      "Google",
      "マップ",
      "地図",
      "写真",
      "画像",
      "抽出",
      "ダウンロード",
    ],
  },
  {
    id: 8,
    title: "動画の音声除去",
    content: "動画の画質を維持して音声トラックを削除します。",
    category: "video",
    icon: "video-off",
    keywords: ["動画", "音声", "ミュート", "無音", "video", "audio"],
  },
  {
    id: 9,
    title: "MongoDBクエリ変換",
    content:
      "Pythonの辞書形式のクエリを、MongoDB Compass用のフィルターに変換します。",
    category: "code",
    icon: "database",
    keywords: [
      "MongoDB",
      "Compass",
      "PyMongo",
      "Python",
      "クエリ",
      "フィルター",
      "dict",
      "datetime",
      "ISODate",
    ],
  },
  {
    id: 10,
    title: "URLエンコード・デコード",
    content: "URLやクエリに使う文字列を、UTF-8のパーセントエンコードに相互変換します。",
    category: "url",
    icon: "globe",
    keywords: ["URL", "クエリ", "パーセント", "encode", "decode", "UTF-8", "変換"],
  },
];

export function searchTools(query: string) {
  const terms = query
    .normalize("NFKC")
    .toLocaleLowerCase("ja")
    .trim()
    .split(/\s+/);
  return ToolCatalog.filter((tool) => {
    const category = ToolCategories.find((item) => item.id === tool.category);
    const text = [tool.title, tool.content, category?.label, ...tool.keywords]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("ja");
    return terms.every((term) => text.includes(term));
  });
}
