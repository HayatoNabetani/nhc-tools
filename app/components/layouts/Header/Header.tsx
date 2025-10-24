"use client";

import { DefaultHeader } from "@/constants/Header";
import { ToolList } from "@/constants/Tools";
import userState from "@/recoil/header/atom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useRecoilState } from "recoil";

const Header = () => {
  const [headerObject, setHeaderObject] = useRecoilState(userState);
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // リロードした際にタイトルが初期値に戻ってしまわないようにする
  useEffect(() => {
    if (pathname.includes("tool")) {
      const id = pathname.split("/")[2];
      const targetTool = ToolList.find((t) => t.id === Number(id));
      setHeaderObject(targetTool!);
    }
  }, [pathname, setHeaderObject]);

  // 検索結果をフィルタリング
  const filteredTools = ToolList.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ツール選択時のハンドラー
  const handleToolSelect = (tool: any) => {
    setHeaderObject(tool);
    router.push(`/tool/${tool.id}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  // 検索入力のハンドラー
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchOpen(e.target.value.length > 0);
  };

  // クリック外側でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="py-2 lg:max-w-5xl lg:w-full mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <Link href="/" onClick={() => setHeaderObject(DefaultHeader)}>
              <Image src="/logo/tool.png" alt="logo" width={120} height={120} />
            </Link>
          </div>
          <div className="">
            <h1 className="font-bold text-2xl">{headerObject?.title}</h1>
            <p className="text-sm">{headerObject?.content}</p>
          </div>
        </div>
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="ツールを検索..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* 検索結果ドロップダウン */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => handleToolSelect(tool)}
                    className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">
                      {tool.title}
                    </div>
                    <div className="text-sm text-gray-500">{tool.content}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center">
                  該当するツールが見つかりません
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
