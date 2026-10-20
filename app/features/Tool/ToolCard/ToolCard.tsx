import { ArrowUpRight, Star } from "lucide-react";
import Link from "next/link";
import ToolIcon from "@/components/elements/ToolIcon/ToolIcon";
import { ToolCategories, type ToolDefinition } from "@/constants/ToolCatalog";

interface Props {
  tool: ToolDefinition;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const ToolCard = ({ tool, isFavorite, onToggleFavorite }: Props) => {
  const category = ToolCategories.find((item) => item.id === tool.category);
  return (
    <article className={`tool-card tool-theme-${tool.category}`}>
      <Link href={`/tool/${tool.id}`} className="tool-card-link">
        <div className="tool-icon-tile">
          <ToolIcon name={tool.icon} />
        </div>
        <h3>{tool.title}</h3>
        <p>{tool.content}</p>
        <div className="tool-card-bottom">
          <span className="tool-category-label">{category?.label}</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </div>
      </Link>
      <button
        type="button"
        className={`favorite-button${isFavorite ? " is-favorite" : ""}`}
        onClick={() => onToggleFavorite(tool.id)}
        aria-pressed={isFavorite}
        aria-label={`${tool.title}をお気に入り${isFavorite ? "から削除" : "に追加"}`}
        title={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      >
        <Star
          size={19}
          fill={isFavorite ? "currentColor" : "none"}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </button>
    </article>
  );
};

export default ToolCard;
