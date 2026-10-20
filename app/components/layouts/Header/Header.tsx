"use client";

import { Grid2X2, Search, Star, X, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import ToolIcon from "@/components/elements/ToolIcon/ToolIcon";
import { searchTools, ToolCatalog } from "@/constants/ToolCatalog";
import { useFavorites } from "@/hooks/useFavorites";

export default function Header() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { favoriteIds } = useFavorites();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const filteredTools = searchTools(query);

  useEffect(() => {
    setIsSearchOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      )
        setIsSearchOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="NHC Tools ホーム">
          <Image
            src="/logo/tool.png"
            alt=""
            width={64}
            height={64}
            className="brand-logo"
            priority
          />
          <span className="brand-name">
            NHC<span>Tools</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label="メインナビゲーション">
          <Link
            href="/#tools"
            className={pathname === "/" ? "nav-link is-current" : "nav-link"}
          >
            <Grid2X2 size={16} aria-hidden="true" />
            ツール一覧
          </Link>
          <Link href="/#favorites" className="nav-link">
            <Star size={17} aria-hidden="true" />
            お気に入り
            {favoriteIds.length > 0 && (
              <span className="nav-count">{favoriteIds.length}</span>
            )}
          </Link>
        </nav>
        <div
          className="header-search"
          ref={searchRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setIsSearchOpen(false);
              toggleRef.current?.focus();
            }
          }}
        >
          <button
            ref={toggleRef}
            type="button"
            className="header-search-toggle"
            aria-label={
              isSearchOpen ? "ツール検索を閉じる" : "ツール検索を開く"
            }
            aria-expanded={isSearchOpen}
            aria-controls="header-search-panel"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Search size={20} aria-hidden="true" />
            )}
          </button>
          {isSearchOpen && (
            <div id="header-search-panel" className="header-search-panel">
              <div className="header-search-field">
                <Search size={18} aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="search"
                  placeholder="ツール名・キーワードで検索"
                  aria-label="ツールを検索"
                  autoComplete="off"
                />
              </div>
              <p className="header-search-caption" role="status">
                {query.trim()
                  ? filteredTools.length + "件のツール"
                  : "すべてのツール"}
              </p>
              <div className="header-search-results">
                {filteredTools.length > 0 ? (
                  filteredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={"/tool/" + tool.id}
                      className={
                        "header-search-result tool-theme-" + tool.category
                      }
                      onClick={() => {
                        setIsSearchOpen(false);
                        setQuery("");
                      }}
                    >
                      <span className="result-icon">
                        <ToolIcon name={tool.icon} />
                      </span>
                      <span>
                        <strong>{tool.title}</strong>
                        <small>{tool.content}</small>
                      </span>
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  ))
                ) : (
                  <p className="header-no-results">
                    該当するツールが見つかりません。
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <span className="header-tool-count">{ToolCatalog.length} TOOLS</span>
      </div>
    </header>
  );
}
