"use client";

import React, { useEffect, useMemo, useState } from "react";

import type {
  ContentType,
  EnergyLevel,
  IdeaAttachment,
  Platform,
} from "../types/ideas";
import { useSavedIdeas, type Idea } from "../hooks/useSavedIdeas";

type ContentHelperMode =
  | "polish"
  | "x_thread"
  | "linkedin_post"
  | "hooks"
  | "outline";

type HelperPlatform = "x" | "linkedin" | "instagram" | "youtube" | "newsletter";

const HELPER_PLATFORM_OPTIONS: Platform[] = [
  "X",
  "LinkedIn",
  "Instagram",
  "Newsletter",
];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "hook", label: "Hook" },
  { value: "thread", label: "Thread" },
  { value: "carousel", label: "Carousel" },
  { value: "email", label: "Email" },
  { value: "script", label: "Script" },
  { value: "other", label: "Other" },
];

export type ContentHelperModalProps = {
  open: boolean;
  initialText: string;
  initialPlatform?: "x" | "linkedin" | "instagram" | "youtube" | "newsletter";
  initialReferenceTweets?: string[];
  initialAttachments?: IdeaAttachment[];
  onClose: () => void;
  onApplySuggestion?: (newText: string) => void;
  onSaveIdea?: (idea: Idea) => void;
};

function platformToHelper(platform?: Platform): HelperPlatform {
  switch (platform) {
    case "X":
      return "x";
    case "LinkedIn":
      return "linkedin";
    case "Instagram":
      return "instagram";
    case "Newsletter":
      return "newsletter";
    case "YouTube":
      return "youtube";
    default:
      return "x";
  }
}

function helperToPlatform(platform?: HelperPlatform): Platform | null {
  switch (platform) {
    case "x":
      return "X";
    case "linkedin":
      return "LinkedIn";
    case "instagram":
      return "Instagram";
    case "newsletter":
      return "Newsletter";
    case "youtube":
      return "YouTube";
    default:
      return null;
  }
}

export function ContentHelperModal({
  open,
  initialText,
  initialPlatform,
  initialReferenceTweets,
  initialAttachments,
  onClose,
  onApplySuggestion,
  onSaveIdea,
}: ContentHelperModalProps) {
  const { saveIdea } = useSavedIdeas();
  const [mode, setMode] = useState<ContentHelperMode>("polish");
  const [text, setText] = useState(initialText ?? "");
  const [referenceTweets, setReferenceTweets] = useState<string[]>(initialReferenceTweets ?? []);
  const [attachments, setAttachments] = useState<IdeaAttachment[]>(initialAttachments ?? []);
  const [platforms, setPlatforms] = useState<Platform[]>(
    helperToPlatform(initialPlatform) ? [helperToPlatform(initialPlatform)!] : [],
  );
  const [includeReferences, setIncludeReferences] = useState(true);
  const [contentType, setContentType] = useState<ContentType>("hook");
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setText(initialText ?? "");
      setPlatforms(helperToPlatform(initialPlatform) ? [helperToPlatform(initialPlatform)!] : []);
      setReferenceTweets(initialReferenceTweets ?? []);
      setAttachments(initialAttachments ?? []);
      setContentType("hook");
      setEnergy(3);
      setIncludeReferences(true);
      setSuggestion("");
      setError(null);
      setMode("polish");
      setHasSaved(false);
    }
  }, [open, initialPlatform, initialText, initialReferenceTweets, initialAttachments]);

  useEffect(() => {
    setHasSaved(false);
  }, [suggestion, initialText]);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  };

  const selectedHelperPlatform = useMemo<HelperPlatform>(
    () => initialPlatform ?? platformToHelper(platforms[0]),
    [initialPlatform, platforms],
  );

  const submitHelper = async () => {
    setHasSaved(false);
    setLoading(true);
    setError(null);
    setSuggestion("");
    try {
      const activeReferenceTweets = includeReferences ? referenceTweets : [];
      const activeAttachments = includeReferences ? attachments : [];
      const attachmentsSummary = activeAttachments
        .map((a) => {
          const base = `[${a.type}] ${a.name ?? a.url}`;
          return a.description ? `${base} – ${a.description}` : base;
        })
        .join("\n");

      const response = await fetch("/api/helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          platform: selectedHelperPlatform,
          ideaText: text.trim(),
          contentType,
          energy,
          referenceTweets: activeReferenceTweets,
          attachmentsSummary,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(
          data?.error === "AI helper not configured"
            ? "AI helper isn’t configured yet. Add your API key on Vercel to enable it."
            : "Unable to fetch suggestion right now.",
        );
        return;
      }

      const data = (await response.json()) as { suggestion?: string };
      setSuggestion(data.suggestion ?? "");
    } catch (err) {
      console.error(err);
      setError("AI helper isn’t configured yet. Add your API key on Vercel to enable it.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (suggestion) {
      void navigator.clipboard.writeText(suggestion);
    }
  };

  const handleSaveSuggestionAsIdea = () => {
    const trimmed = suggestion.trim();
    if (!trimmed) return;

    const platformsArray =
      Array.isArray(platforms) && platforms.length > 0
        ? platforms
        : platforms
          ? [platforms].flat()
          : [];

    const now = new Date().toISOString();

    const newIdea: Idea = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now()),
      text: trimmed,
      contentType,
      status: "Ready",
      nextAction: "outline",
      platforms: platformsArray,
      energy,
      createdAt: now,
      updatedAt: now,
      attachments,
      referenceTweets,
    };

    saveIdea(newIdea);
    onSaveIdea?.(newIdea);
    setHasSaved(true);
  };

  const handleReplace = () => {
    if (!suggestion.trim()) return;
    onApplySuggestion?.(suggestion.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900/90">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Content Helper</h3>
            <p className="text-sm text-slate-600 dark:text-slate-200">AI-powered assistance for polishing your idea.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200 dark:text-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Mode</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Polish this post", value: "polish" },
                { label: "Turn into X thread", value: "x_thread" },
                { label: "Turn into LinkedIn post", value: "linkedin_post" },
                { label: "Generate 5 hooks", value: "hooks" },
                { label: "Outline this idea", value: "outline" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value as ContentHelperMode)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    mode === option.value
                      ? "border-sky-500 bg-sky-500 text-white dark:bg-sky-500 dark:text-white"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Idea text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50 dark:placeholder:text-slate-500"
                placeholder="Paste your idea here"
              />
            </div>

            {(referenceTweets.length > 0 || attachments.length > 0) && (
              <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-300 space-y-1">
                <div className="font-semibold text-[11px] text-slate-200">Context used</div>
                {referenceTweets.length > 0 && (
                  <div>
                    <span className="font-medium">Tweets:</span>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      {referenceTweets.map((url) => (
                        <li key={url} className="truncate">{url}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {attachments.length > 0 && (
                  <div>
                    <span className="font-medium">Media:</span>
                    <ul className="mt-1 list-disc pl-4 space-y-0.5">
                      {attachments.map((a) => (
                        <li key={a.id} className="truncate">
                          {a.name ?? a.url} {a.description ? `– ${a.description}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {HELPER_PLATFORM_OPTIONS.map((platform) => {
                  const active = platforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => togglePlatform(platform)}
                      className={`rounded-full border px-3 py-1 text-sm transition ${
                        active
                          ? "border-sky-500 bg-sky-500 text-white dark:bg-sky-500 dark:text-white"
                          : "border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeReferences}
                onChange={(e) => setIncludeReferences(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Include reference tweets/context
            </label>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-50">Content type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50"
                >
                  {CONTENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-900 dark:text-slate-50">Energy</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value) as EnergyLevel)}
                    className="flex-1"
                  />
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-50">⚡{energy}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={submitHelper}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Thinking..." : "Ask helper"}
            </button>

            {error && <p className="text-sm text-amber-600">{error}</p>}

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Suggestion</p>
              <div
                className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 max-h-72 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40"
              >
                {suggestion ? (
                  <p className="whitespace-pre-line leading-relaxed">
                    {suggestion}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm">No suggestion yet.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!suggestion}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 disabled:opacity-50"
                >
                  Copy suggestion
                </button>
                <button
                  type="button"
                  onClick={handleSaveSuggestionAsIdea}
                  disabled={!suggestion.trim() || loading}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition bg-violet-500 text-white shadow hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {hasSaved ? "Saved to Saved Ideas" : "Save to Saved Ideas"}
                </button>
                {onApplySuggestion && (
                  <button
                    type="button"
                    onClick={handleReplace}
                    disabled={!suggestion}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm hover:border-emerald-300 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-100 disabled:opacity-50"
                  >
                    Replace idea text
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
