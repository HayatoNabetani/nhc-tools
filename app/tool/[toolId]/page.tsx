"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Grid2X2,
  SearchX,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import ToolIcon from "@/components/elements/ToolIcon/ToolIcon";
import { ToolList } from "@/constants/Tools";
import { ToolCategories } from "@/constants/ToolCatalog";
import ToolCard from "@/features/Tool/ToolCard/ToolCard";
import { useFavorites } from "@/hooks/useFavorites";

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = ToolList.find((item) => String(item.id) === toolId);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const category = ToolCategories.find((item) => item.id === tool?.category);
  const relatedTools = tool
    ? ToolList.filter((item) => item.id !== tool.id)
        .sort(
          (a, b) =>
            Number(b.category === tool.category) -
            Number(a.category === tool.category),
        )
        .slice(0, 4)
    : [];
  const isFavorite = tool ? favoriteIds.includes(tool.id) : false;

  useEffect(() => {
    document.title = tool
      ? tool.title + " | NHC Tools"
      : "ツールが見つかりません | NHC Tools";
    return () => {
      document.title = "NHC Tools";
    };
  }, [tool]);

  if (!tool)
    return (
      <main id="main-content" className="tool-page">
        <div className="search-empty">
          <SearchX size={36} aria-hidden="true" />
          <h1>ツールが見つかりませんでした</h1>
          <p>ツール一覧から、使いたいツールをお探しください。</p>
          <Link href="/" className="primary-button">
            <ArrowLeft size={16} aria-hidden="true" />
            ツール一覧へ戻る
          </Link>
        </div>
      </main>
    );

  return (
    <main id="main-content" className="tool-page">
      <nav className="breadcrumbs" aria-label="パンくずリスト">
        <Link href="/">ツール一覧</Link>
        <ChevronRight size={13} aria-hidden="true" />
        <span aria-current="page">{tool.title}</span>
      </nav>
      <div className={"tool-page-heading tool-theme-" + tool.category}>
        <span className="tool-icon-tile">
          <ToolIcon name={tool.icon} />
        </span>
        <div>
          <span className="detail-category">{category?.label}</span>
          <h1>{tool.title}</h1>
          <p>{tool.content}</p>
        </div>
        <button
          type="button"
          className={"detail-favorite" + (isFavorite ? " is-favorite" : "")}
          aria-pressed={isFavorite}
          aria-label={
            tool.title +
            (isFavorite ? "をお気に入りから削除" : "をお気に入りに追加")
          }
          onClick={() => toggleFavorite(tool.id)}
        >
          <Star
            size={17}
            fill={isFavorite ? "currentColor" : "none"}
            aria-hidden="true"
          />
          <span>{isFavorite ? "登録済み" : "お気に入り"}</span>
        </button>
      </div>
      <section
        className="tool-workspace"
        aria-label={tool.title + "の作業エリア"}
      >
        <Suspense
          key={tool.id}
          fallback={
            <div className="tool-loading" role="status">
              ツールを読み込んでいます…
            </div>
          }
        >
          <tool.Component key={tool.id} />
        </Suspense>
      </section>
      <section className="related-tools" aria-labelledby="related-heading">
        <div className="section-heading">
          <div className="section-title">
            <Grid2X2 size={19} aria-hidden="true" />
            <h2 id="related-heading">こちらのツールも</h2>
          </div>
          <Link href="/#tools" className="text-button">
            すべて見る
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="tool-grid">
          {relatedTools.map((item) => (
            <ToolCard
              key={item.id}
              tool={item}
              isFavorite={favoriteIds.includes(item.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
