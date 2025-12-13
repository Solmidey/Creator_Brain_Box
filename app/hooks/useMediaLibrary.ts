"use client";

import { useCallback, useEffect, useState } from "react";

import type { IdeaAttachment } from "../types/ideas";

export type MediaKind = "image" | "video" | "file";

export interface MediaItem {
  id: string;
  type: MediaKind;
  url: string;
  name: string;
  size?: number;
  createdAt: string; // ISO string
  sourceIdeaId?: string; // optional for future use
}

const STORAGE_KEY = "creator-brain-media-library-v1";

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);

  // load from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as MediaItem[];
      setItems(parsed);
    } catch {
      // ignore malformed data
    }
  }, []);

  const persist = useCallback((next: MediaItem[]) => {
    setItems(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const addItems = useCallback(
    (newItems: MediaItem[]) => {
      persist([...newItems, ...items]);
    },
    [items, persist],
  );

  const addFromFiles = useCallback(
    (files: File[], sourceIdeaId?: string) => {
      if (!files.length) return;
      const now = new Date().toISOString();
      const newItems: MediaItem[] = files.map((file) => {
        const isVideo = file.type.startsWith("video");
        const kind: MediaKind = isVideo ? "video" : "image";
        const url = URL.createObjectURL(file); // client preview; fine for local library

        return {
          id: `${now}-${file.name}-${Math.random().toString(36).slice(2)}`,
          type: kind,
          url,
          name: file.name,
          size: file.size,
          createdAt: now,
          sourceIdeaId,
        };
      });
      addItems(newItems);
    },
    [addItems],
  );

  const addFromAttachment = useCallback(
    (attachment: IdeaAttachment, sourceIdeaId?: string) => {
      const now = new Date().toISOString();
      const kind: MediaKind =
        attachment.type === "image" || attachment.type === "video"
          ? attachment.type
          : "file";

      const item: MediaItem = {
        id: `${now}-${attachment.id}`,
        type: kind,
        url: attachment.url,
        name: attachment.name ?? attachment.url,
        createdAt: now,
        sourceIdeaId,
      };

      addItems([item]);
    },
    [addItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      const next = items.filter((i) => i.id !== id);
      persist(next);
    },
    [items, persist],
  );

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return {
    items,
    addFromFiles,
    addFromAttachment,
    removeItem,
    clearAll,
  };
}

export default useMediaLibrary;
