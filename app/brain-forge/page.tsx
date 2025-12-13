"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ContentHelperModal, type ContentHelperModalProps } from "../components/ContentHelperModal";
import { useSavedIdeas, type Idea } from "../hooks/useSavedIdeas";
import type { ContentType, IdeaStatus, Platform } from "../types/ideas";

const STATUS_FILTERS: (IdeaStatus | "All")[] = ["All", "Inbox", "Ready", "Drafting", "Posted"];
const PLATFORM_OPTIONS: Platform[] = ["X", "LinkedIn", "Instagram", "Newsletter", "YouTube"];
const CONTENT_TYPE_OPTIONS: ContentType[] = ["thread", "hook", "carousel", "email", "script"];

function platformToHelperPlatform(platform?: Platform): ContentHelperModalProps["initialPlatform"] {
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
      return undefined;
  }
}

function getIdeaPreview(text: string) {
  if (!text?.trim()) return "Untitled idea";
  const firstLine = text.trim().split("\n")[0];
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

export default function BrainForgePage() {
  const { savedIdeas, saveIdea, updateIdea } = useSavedIdeas();
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorBody, setEditorBody] = useState("");
  const [editorPlatform, setEditorPlatform] = useState<Platform>("X");
  const [editorContentType, setEditorContentType] = useState<ContentType>("thread");
  const [outline, setOutline] = useState("");
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperInitialText, setHelperInitialText] = useState("");

  const filteredIdeas = useMemo(() => {
    if (statusFilter === "All") return savedIdeas;
    return savedIdeas.filter((idea) => idea.status === statusFilter);
  }, [savedIdeas, statusFilter]);

  const handleLoadIdea = (idea: Idea) => {
    setActiveIdeaId(idea.id);
    setEditorBody(idea.text ?? "");
    setEditorContentType(idea.contentType ?? "thread");
    setEditorPlatform(idea.platforms?.[0] ?? "X");
    setEditorTitle(getIdeaPreview(idea.text ?? ""));
  };

  const handleSaveBackToIdea = () => {
    if (!activeIdeaId) return;
    updateIdea(activeIdeaId, {
      text: editorBody,
      contentType: editorContentType,
      platforms: [editorPlatform],
    });
  };

  const handleSaveAsNewIdea = () => {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      text: editorBody,
      contentType: editorContentType,
      platforms: [editorPlatform],
      status: "Ready",
      nextAction: "outline",
      energy: 3,
      createdAt: now,
      updatedAt: now,
      attachments: [],
      referenceTweets: [],
    };

    saveIdea(newIdea);
    setActiveIdeaId(newIdea.id);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-4 px-4 pb-10 pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xs text-slate-400 transition hover:text-slate-200">
            ← Back to Inbox
          </Link>
          <div className="ml-auto text-right">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">Brain Forge</h1>
            <p className="text-xs text-slate-400">
              Vault for your cracked ideas. Draft, edit, and structure content in one place.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.5fr_1.1fr]">
          <section className="space-y-2 rounded-3xl border border-slate-900/80 bg-slate-900/70 p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300">Ideas</h2>
              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                {STATUS_FILTERS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-full px-2 py-1 transition ${
                      statusFilter === status
                        ? "bg-sky-500/20 text-sky-100"
                        : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[70vh] space-y-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/70 p-2">
              {filteredIdeas.length === 0 && (
                <p className="px-2 py-4 text-center text-[11px] text-slate-500">No ideas match this filter.</p>
              )}
              {filteredIdeas.map((idea) => (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => handleLoadIdea(idea)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-[11px] leading-snug transition hover:bg-slate-800/80 ${
                    idea.id === activeIdeaId ? "border border-sky-500/70 bg-slate-800/90" : ""
                  }`}
                >
                  <div className="line-clamp-2 text-slate-100">{getIdeaPreview(idea.text)}</div>
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-slate-400">
                    <span className="rounded-full bg-slate-800/90 px-2 py-0.5">{idea.status}</span>
                    {idea.platforms?.map((platform) => (
                      <span key={platform} className="rounded-full bg-slate-800/90 px-2 py-0.5">
                        {platform}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-slate-900/80 bg-slate-900/60 p-4 shadow-xl">
            <input
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              placeholder="Working title (optional)"
              className="mb-2 w-full bg-transparent text-base font-semibold text-slate-50 outline-none placeholder:text-slate-500"
            />

            <div className="mb-3 flex flex-wrap gap-2 text-[11px]">
              <div className="flex flex-wrap items-center gap-1">
                {PLATFORM_OPTIONS.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => setEditorPlatform(platform)}
                    className={`rounded-full border px-3 py-1 font-semibold transition ${
                      editorPlatform === platform
                        ? "border-sky-500 bg-sky-500/20 text-sky-100"
                        : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <select
                value={editorContentType}
                onChange={(e) => setEditorContentType(e.target.value as ContentType)}
                className="rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1 font-semibold text-slate-200 outline-none"
              >
                {CONTENT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-slate-50">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              value={editorBody}
              onChange={(e) => setEditorBody(e.target.value)}
              rows={14}
              className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm text-slate-100 outline-none"
              placeholder="Start forging your cracked idea here..."
            />

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2 text-[11px] text-slate-400">
                <span>{editorBody.length} chars</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveBackToIdea}
                  disabled={!activeIdeaId}
                  className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 disabled:opacity-40"
                >
                  Save to current idea
                </button>
                <button
                  type="button"
                  onClick={handleSaveAsNewIdea}
                  className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-400"
                >
                  Save as new idea
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-slate-900/80 bg-slate-900/70 p-3 shadow-lg">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-200">Structure</h2>
              <p className="mt-1 text-[11px] text-slate-400">Sketch your hook, main points, and CTA.</p>
              <textarea
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={8}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none"
                placeholder="- Hook\n- Point 1\n- Point 2\n- CTA"
              />
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-200">Content Helper</h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Send this draft to the helper for polishing, threads, or carousels.
              </p>
              <button
                type="button"
                onClick={() => {
                  setHelperInitialText(editorBody || outline || editorTitle);
                  setHelperOpen(true);
                }}
                className="mt-2 w-full rounded-full bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-400"
              >
                Ask helper on this draft
              </button>
            </div>
          </section>
        </div>
      </div>

      <ContentHelperModal
        open={helperOpen}
        initialText={helperInitialText}
        initialPlatform={platformToHelperPlatform(editorPlatform)}
        onClose={() => setHelperOpen(false)}
        onApplySuggestion={(newText) => {
          setEditorBody(newText);
          setHelperOpen(false);
        }}
      />
    </main>
  );
}
