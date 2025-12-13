"use client";

import { useCallback, useEffect, useState } from "react";

export type MediaKind = "image" | "video" | "file";

export interface MediaItem {
  id: string;
  type: MediaKind;
  url: string;
  name: string;
  size?: number;
  createdAt: string;       // ISO string
  sourceIdeaId?: string;   // optional link back to an idea
}

const STORAGE_KEY = "creator-brain-media-library-v1";

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as MediaItem[];
      setItems(parsed);
    } catch (err) {
      console.error("[mediaLibrary] Failed to read storage", err);
    }
  }, []);

  // Helper to update state + localStorage in one place
  const persist = useCallback(
    (updater: (prev: MediaItem[]) => MediaItem[]) => {
      setItems(prev => {
        const next = updater(prev);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }
        return next;
      });
    },
    []
  );

  // Add items from uploaded File objects
  const addFromFiles = useCallback(
    (files: File[], sourceIdeaId?: string) => {
      if (!files.length) return;
      const now = new Date().toISOString();

      persist(prev => [
        ...files.map(file => {
          const kind: MediaKind = file.type.startsWith("video")
            ? "video"
            : file.type.startsWith("image")
            ? "image"
            : "file";

          const url = URL.createObjectURL(file);

          return {
            id: `${now}-${file.name}-${Math.random().toString(36).slice(2)}`,
            type: kind,
            url,
            name: file.name,
            size: file.size,
            createdAt: now,
            sourceIdeaId,
          } as MediaItem;
        }),
        ...prev,
      ]);
    },
    [persist]
  );

  // Add a fully-formed MediaItem (for future use if needed)
  const addItem = useCallback(
    (item: MediaItem) => {
      persist(prev => [item, ...prev]);
    },
    [persist]
  );

  const removeItem = useCallback(
    (id: string) => {
      persist(prev => prev.filter(item => item.id !== id));
    },
    [persist]
  );

  const clearAll = useCallback(() => {
    persist(() => []);
  }, [persist]);

  return {
    items,
    addFromFiles,
    addItem,
    removeItem,
    clearAll,
  };
}
