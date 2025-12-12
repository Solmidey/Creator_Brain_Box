"use client";

import { useEffect, useState } from "react";

import type { Idea } from "../types/ideas";

const STORAGE_KEY = "creator-brain-inbox-ideas";

function normalizeIdea(idea: Idea): Idea {
  return {
    ...idea,
    updatedAt: idea.updatedAt ?? idea.createdAt,
    attachments: idea.attachments ?? [],
    referenceTweets: idea.referenceTweets ?? [],
  };
}

export function useSavedIdeas() {
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setSavedIdeas(parsed.map(normalizeIdea));
    } catch (e) {
      console.error("Failed to load saved ideas", e);
    }
  }, []);

  const persist = (ideas: Idea[]) => {
    setSavedIdeas(ideas);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    }
  };

  const saveIdea = (idea: Idea) => {
    persist([normalizeIdea(idea), ...savedIdeas]);
  };

  const updateIdea = (id: string, patch: Partial<Idea>) => {
    persist(
      savedIdeas.map((idea) =>
        idea.id === id
          ? normalizeIdea({
              ...idea,
              ...patch,
              updatedAt: new Date().toISOString(),
            })
          : idea,
      ),
    );
  };

  const deleteIdea = (id: string) => {
    persist(savedIdeas.filter((idea) => idea.id !== id));
  };

  const clearIdeas = () => {
    persist([]);
  };

  return { savedIdeas, saveIdea, updateIdea, deleteIdea, clearIdeas };
}
