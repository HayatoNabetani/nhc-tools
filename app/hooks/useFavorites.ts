"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { ToolCatalog } from "@/constants/ToolCatalog";

const STORAGE_KEY = "nhc-tools:favorites";
const CHANGE_EVENT = "nhc-tools:favorites-changed";
const toolIds = new Set(ToolCatalog.map((tool) => tool.id));
let memorySnapshot = "[]";
let useMemoryStorage = false;

function getSnapshot() {
  if (useMemoryStorage) return memorySnapshot;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return memorySnapshot;
  }
}

function getServerSnapshot() {
  return "[]";
}

function parseFavorites(snapshot: string): number[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value)
      ? Array.from(
          new Set(
            value.filter(
              (id): id is number => typeof id === "number" && toolIds.has(id),
            ),
          ),
        )
      : [];
  } catch {
    return [];
  }
}

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(CHANGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(CHANGE_EVENT, notify);
  };
}

export function useFavorites() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const favoriteIds = useMemo(() => parseFavorites(snapshot), [snapshot]);
  const toggleFavorite = useCallback((id: number) => {
    if (!toolIds.has(id)) return;
    const current = parseFavorites(getSnapshot());
    const next = current.includes(id)
      ? current.filter((favoriteId) => favoriteId !== id)
      : [...current, id];
    memorySnapshot = JSON.stringify(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, memorySnapshot);
    } catch {
      // ストレージを使えない環境でも、このタブ内ではお気に入りを利用できる。
      useMemoryStorage = true;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  return { favoriteIds, toggleFavorite };
}
