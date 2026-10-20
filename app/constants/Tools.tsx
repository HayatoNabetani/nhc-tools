import BackgroundRemover from "@/features/BackgroundRemover/BackgroundRemover";
import GoogleMapPhoto from "@/features/GoogleMapPhoto/GoogleMapPhoto";
import JsonPrettyLinter from "@/features/JsonPrettyLinter/JsonPrettyLinter";
import JstConverter from "@/features/JstConverter/JstConverter";
import MakingArray from "@/features/MakingArray/MakingArray";
import MakingDictArray from "@/features/MakingDictArray/MakingDictArray";
import QueryParams from "@/features/QueryParams/QueryParams";
import VideoAudioRemover from "@/features/VideoAudioRemover/VideoAudioRemover";
import { ToolCatalog } from "./ToolCatalog";

const toolComponents: Record<number, React.ComponentType> = {
  1: JstConverter,
  2: JsonPrettyLinter,
  3: MakingArray,
  4: QueryParams,
  5: MakingDictArray,
  6: BackgroundRemover,
  7: GoogleMapPhoto,
  8: VideoAudioRemover,
};

export const ToolList = ToolCatalog.map((tool) => ({
  ...tool,
  Component: toolComponents[tool.id],
}));
