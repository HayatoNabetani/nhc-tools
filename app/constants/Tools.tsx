import BackgroundRemover from "@/features/BackgroundRemover/BackgroundRemover";
import JsonPrettyLinter from "@/features/JsonPrettyLinter/JsonPrettyLinter";
import JstConverter from "@/features/JstConverter/JstConverter";
import MakingArray from "@/features/MakingArray/MakingArray";
import MakingDictArray from "@/features/MakingDictArray/MakingDictArray";
import QueryParams from "@/features/QueryParams/QueryParams";

export const ToolList: ToolSetWithComponent[] = [
  {
    id: 1,
    title: "日本時間に変換",
    content: "全国の時間を日本時間に直します。",
    Component: JstConverter,
  },
  {
    id: 2,
    title: "JSON 綺麗に整える",
    content: "JSONを整える",
    Component: JsonPrettyLinter,
  },
  {
    id: 3,
    title: "配列生成",
    content: "テキストから配列を出力する",
    Component: MakingArray,
  },
  {
    id: 4,
    title: "URL",
    content: "クエリーパラメータ分析、URL作成",
    Component: QueryParams,
  },
  {
    id: 5,
    title: "辞書配列メーカー",
    content: "キーバリュー必要な分だけ作成します",
    Component: MakingDictArray,
  },
  {
    id: 6,
    title: "背景透過切り抜き",
    content: "写真から被写体を切り抜いて透過PNGにします",
    Component: BackgroundRemover,
  },
];
