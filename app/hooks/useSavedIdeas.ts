"use client";

import { useEffect, useMemo, useState } from "react";
import type { Idea } from "../types/ideas";

const STORAGE_KEY = "creator-brain-inbox-ideas";

export function getSeedIdeas(): Idea[] {
  const now = new Date();
  return [
    {
      id: "seed-1",
      text: "Summarize my top 3 growth lessons from 2024 as a punchy carousel.",
      platforms: ["LinkedIn", "Instagram"],
      contentType: "carousel",
      energy: 3,
      status: "Inbox",
      nextAction: "outline",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      attachments: [],
      referenceTweets: [],
    },
    {
      id: "seed-2",
      text: "Thread on repurposing YouTube scripts into newsletters without sounding robotic.",
      platforms: ["X", "Newsletter", "YouTube"],
      contentType: "thread",
      energy: 4,
      status: "Ready",
      nextAction: "publish",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(),
      attachments: [],
      referenceTweets: [],
    },
    {
      id: "seed-3",
      text: "Write an honest email about balancing creative sprints with rest days.",
      platforms: ["Newsletter"],
      contentType: "email",
      energy: 2,
      status: "Drafting",
      nextAction: "outline",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 72).toISOString(),
      attachments: [],
      referenceTweets: [],
    },
    {
      id: "seed-4",
      text: "Short YouTube script: behind-the-scenes of building a one-person media lab.",
      platforms: ["YouTube"],
      contentType: "script",
      energy: 5,
      status: "Inbox",
      nextAction: "brain_dump",
      createdAt: now.toISOString(),
      attachments: [],
      referenceTweets: [],
    },
  ];
}

function normalizeIdea(idea: Idea): Idea {
  return {
    ...idea,
    attachments: idea.attachments ?? [],
    referenceTweets: idea.referenceTweets ?? [],
  };
}

export function useSavedIdeas(seedIdeas?: Idea[]) {
  const fallbackIdeas = useMemo(() => seedIdeas ?? getSeedIdeas(), [seedIdeas]);
  const [savedIdeas, setSavedIdeas] = useState<Idea[]>(fallbackIdeas);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Idea[];
        setSavedIdeas(parsed.map(normalizeIdea));
      } else {
        setSavedIdeas(fallbackIdeas.map(normalizeIdea));
      }
    } catch (error) {
      console.error("Failed to load ideas", error);
      setSavedIdeas(fallbackIdeas.map(normalizeIdea));
    } finally {
      setHydrated(true);
    }
  }, [fallbackIdeas]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const payload = JSON.stringify(savedIdeas);
    localStorage.setItem(STORAGE_KEY, payload);
  }, [savedIdeas, hydrated]);

  const saveIdea = (idea: Idea) => {
    setSavedIdeas((prev) => {
      const next = prev.map((entry) => (entry.id === idea.id ? normalizeIdea(idea) : entry));
      const exists = prev.some((entry) => entry.id === idea.id);
      return exists ? next : [normalizeIdea(idea), ...prev];
    });
  };

  const deleteIdea = (id: string) => {
    setSavedIdeas((prev) => prev.filter((idea) => idea.id !== id));
  };

  const clearIdeas = () => setSavedIdeas([]);

  return useMemo(
    () => ({ savedIdeas, saveIdea, deleteIdea, clearIdeas, hydrated }),
    [savedIdeas, hydrated],
  );
}
