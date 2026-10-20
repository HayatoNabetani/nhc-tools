"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Grid2X2, Search, SearchX, Star, X } from "lucide-react";
import ToolIcon from "@/components/elements/ToolIcon/ToolIcon";
import ToolCard from "@/features/Tool/ToolCard/ToolCard";
import {
  searchTools,
  ToolCatalog,
  ToolCategories,
  type ToolCategoryId,
} from "@/constants/ToolCatalog";
import { useFavorites } from "@/hooks/useFavorites";

type CategoryFilter = "all" | ToolCategoryId;

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const { favoriteIds, toggleFavorite } = useFavorites();
  const searchRef = useRef<HTMLInputElement>(null);
  const matchingTools = searchTools(query);
  const visibleTools = matchingTools.filter(
    (tool) => category === "all" || tool.category === category,
  );
  const favoriteTools = ToolCatalog.filter((tool) =>
    favoriteIds.includes(tool.id),
  );
  const activeCategory = ToolCategories.find((item) => item.id === category);
  const isFiltered = query.trim().length > 0 || category !== "all";

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target?.isContentEditable ||
        target?.closest("input, textarea, select")
      )
        return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    searchRef.current?.focus();
  };

  return (
    <main id="main-content" className="home-main">
      <section className="home-hero" aria-labelledby="home-title">
        <h1 id="home-title">ツール一覧</h1>
        <div className="hero-search">
          <Search size={22} aria-hidden="true" />
          <input
            ref={searchRef}
            id="tool-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
            placeholder="ツール名・キーワードで検索"
            aria-label="ツール名やキーワードで検索"
            aria-controls="tool-results"
            autoComplete="off"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
              aria-label="検索をクリア"
            >
              <X size={19} />
            </button>
          ) : (
            <kbd aria-hidden="true">/</kbd>
          )}
        </div>
        <p className="search-hint">
          検索例：{" "}
          <button
            type="button"
            onClick={() => {
              setQuery("JSON");
              setCategory("all");
            }}
          >
            JSON
          </button>
          <span>、</span>
          <button
            type="button"
            onClick={() => {
              setQuery("背景透過");
              setCategory("all");
            }}
          >
            背景透過
          </button>
          <span>、</span>
          <button
            type="button"
            onClick={() => {
              setQuery("日本時間");
              setCategory("all");
            }}
          >
            日本時間
          </button>
        </p>
        <div
          className="category-filters"
          role="group"
          aria-label="カテゴリで絞り込み"
        >
          <button
            type="button"
            className={`category-chip${category === "all" ? " is-active" : ""}`}
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
          >
            <Grid2X2 size={16} aria-hidden="true" />
            すべて<span>{ToolCatalog.length}</span>
          </button>
          {ToolCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`category-chip${category === item.id ? " is-active" : ""}`}
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
            >
              <ToolIcon name={item.icon} />
              {item.label}
              <span>
                {ToolCatalog.filter((tool) => tool.category === item.id).length}
              </span>
            </button>
          ))}
        </div>
      </section>
      <div className="catalog-container">
        <section
          id="favorites"
          className="favorites-section"
          aria-labelledby="favorites-heading"
        >
          <div className="section-heading">
            <div className="section-title">
              <Star className="section-star" size={20} aria-hidden="true" />
              <h2 id="favorites-heading">お気に入り</h2>
              <span className="section-count">{favoriteTools.length}</span>
            </div>
          </div>
          {favoriteTools.length > 0 ? (
            <div className="tool-grid">
              {favoriteTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="favorites-empty">
              <span className="empty-star">
                <Star size={21} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <p>お気に入りは未登録です</p>
                <span>カードの ☆ で登録できます。</span>
              </div>
            </div>
          )}
        </section>
        <section
          id="tools"
          className="tools-section"
          aria-labelledby="tools-heading"
        >
          <div className="section-heading">
            <div className="section-title">
              <Grid2X2 size={20} aria-hidden="true" />
              <h2 id="tools-heading">
                {query.trim()
                  ? "検索結果"
                  : (activeCategory?.label ?? "すべてのツール")}
              </h2>
              <span className="section-count">{visibleTools.length}</span>
            </div>
            <div className="section-actions">
              {isFiltered && (
                <button
                  type="button"
                  className="text-button"
                  onClick={resetFilters}
                >
                  <X size={14} aria-hidden="true" />
                  絞り込みを解除
                </button>
              )}
              <span className="section-caption">
                全{ToolCatalog.length}ツール
              </span>
            </div>
          </div>
          <p className="sr-only" role="status">
            {visibleTools.length}件のツールが見つかりました。
          </p>
          <div id="tool-results">
            {visibleTools.length > 0 ? (
              <div className="tool-grid">
                {visibleTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    isFavorite={favoriteIds.includes(tool.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="search-empty">
                <SearchX size={32} strokeWidth={1.5} aria-hidden="true" />
                <h3>ツールが見つかりませんでした</h3>
                <p>別のキーワードやカテゴリで探してみてください。</p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={resetFilters}
                >
                  すべてのツールを表示
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
