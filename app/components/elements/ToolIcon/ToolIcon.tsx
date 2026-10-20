import {
  Braces,
  Clock3,
  Code2,
  Film,
  Globe2,
  Image,
  ImageMinus,
  Link2,
  List,
  ListTree,
  MapPin,
  VideoOff,
} from "lucide-react";
import type { ToolIconName } from "@/constants/ToolCatalog";

const icons = {
  clock: Clock3,
  braces: Braces,
  list: List,
  link: Link2,
  "list-tree": ListTree,
  "image-minus": ImageMinus,
  "map-pin": MapPin,
  "video-off": VideoOff,
  code: Code2,
  image: Image,
  video: Film,
  globe: Globe2,
};

export default function ToolIcon({
  name,
  className,
}: {
  name: ToolIconName;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <Icon
      className={className}
      size={24}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}
