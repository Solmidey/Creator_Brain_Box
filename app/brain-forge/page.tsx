"use client";

import Link from "next/link";
import { type ChangeEvent, useMemo, useState } from "react";

import { ContentHelperModal, type ContentHelperModalProps } from "../components/ContentHelperModal";
import { PlatformPreview } from "../components/PlatformPreview";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useSavedIdeas, type Idea } from "../hooks/useSavedIdeas";
import type { ContentType, IdeaAttachment, IdeaStatus, Platform as IdeaPlatform } from "../types/ideas";

type Platform = "x" | "instagram" | "youtube" | "newsletter";

const PLATFORM_CONFIG: Record<Platform, {
  editorLabel: string;
  editorPlaceholder: string;
  outlinePlaceholder: string;
  mediaHint: string;
}> = {
  x: {
    editorLabel: "X thread builder",
    editorPlaceholder:
      "Write this like a thread.\n\nLine 1 = HOOK\n\n1/ First point\n2/ Second point\n3/ Third point\n\nEnd with a simple CTA.",
    outlinePlaceholder:
      "Hook – one line that grabs attention\nTweet 1 – main point\nTweet 2 – example or story\nCTA – what you want them to do",
    mediaHint: "X: up to 4 images, 1 video, or a quote tweet.",
  },
  instagram: {
    editorLabel: "Instagram carousel builder",
    editorPlaceholder:
      "Think in slides.\n\nSLIDE 1 – Hook\nSLIDE 2–4 – Value / tips\nSLIDE 5 – Story or example\nLAST SLIDE – CTA (what they should do next).",
    outlinePlaceholder:
      "Slide 1 – hook\nSlides 2–3 – main tips\nSlide 4 – proof / story\nLast slide – CTA",
    mediaHint: "Instagram: think in slides or reels – images, carousels, or short video.",
  },
  youtube: {
    editorLabel: "YouTube / video script",
    editorPlaceholder:
      "Write a simple script.\n\nINTRO – hook them fast\nSECTION 1 – main idea\nSECTION 2 – example / demo\nSECTION 3 – key takeaways\nOUTRO – CTA + what to watch next.",
    outlinePlaceholder:
      "Intro – hook\nPart 1 – main idea\nPart 2 – example or story\nOutro – CTA",
    mediaHint:
      "YouTube: focus on the main video. You can still attach a reference doc or thumbnail idea.",
  },
  newsletter: {
    editorLabel: "Newsletter / long-form",
    editorPlaceholder:
      "Write this like an email or newsletter.\n\nSUBJECT – short, clear promise\nOPENING – why this matters\nBODY – 2–3 clear points\nWRAP-UP – summary\nCTA / PS – what they should do next.",
    outlinePlaceholder:
      "Subject – big promise\nOpening – 1–2 lines\nBody – 2–3 points\nCTA / PS – next step",
    mediaHint: "Newsletter: optional header image, screenshots, or reference links.",
  },
};

const STATUS_FILTERS: (IdeaStatus | "All")[] = ["All", "Inbox", "Ready", "Drafting", "Posted"];
const PLATFORM_OPTIONS: Platform[] = ["x", "instagram", "youtube", "newsletter"];
const CONTENT_TYPE_OPTIONS: ContentType[] = ["thread", "hook", "carousel", "email", "script"];

function platformToHelperPlatform(platform?: Platform): ContentHelperModalProps["initialPlatform"] {
  switch (platform) {
    case "x":
      return "x";
    case "instagram":
      return "instagram";
    case "newsletter":
      return "newsletter";
    case "youtube":
      return "youtube";
    default:
      return undefined;
  }
}

function ideaPlatformToEditorPlatform(platform?: IdeaPlatform): Platform {
  switch (platform) {
    case "Instagram":
      return "instagram";
    case "YouTube":
      return "youtube";
    case "Newsletter":
      return "newsletter";
    default:
      return "x";
  }
}

function editorPlatformToIdeaPlatform(platform: Platform): IdeaPlatform {
  switch (platform) {
    case "instagram":
      return "Instagram";
    case "youtube":
      return "YouTube";
    case "newsletter":
      return "Newsletter";
    default:
      return "X";
  }
}

function getIdeaPreview(text: string) {
  if (!text?.trim()) return "Untitled idea";
  const firstLine = text.trim().split("\n")[0];
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
}

export default function BrainForgePage() {
  const { savedIdeas, saveIdea, updateIdea } = useSavedIdeas();
  const mediaLibrary = useMediaLibrary();
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorBody, setEditorBody] = useState("");
  const [editorPlatform, setEditorPlatform] = useState<Platform>("x");
  const [editorContentType, setEditorContentType] = useState<ContentType>("thread");
  const [outline, setOutline] = useState("");
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperInitialText, setHelperInitialText] = useState("");
  const [attachments, setAttachments] = useState<IdeaAttachment[]>([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState("");

  const platformConfig = PLATFORM_CONFIG[editorPlatform];
  const platformMediaHint = platformConfig.mediaHint;

  const filteredIdeas = useMemo(() => {
    if (statusFilter === "All") return savedIdeas;
    return savedIdeas.filter((idea) => idea.status === statusFilter);
  }, [savedIdeas, statusFilter]);

  const handleLoadIdea = (idea: Idea) => {
    setActiveIdeaId(idea.id);
    setEditorBody(idea.text ?? "");
    setEditorContentType(idea.contentType ?? "thread");
    setEditorPlatform(ideaPlatformToEditorPlatform(idea.platforms?.[0]));
    setEditorTitle(getIdeaPreview(idea.text ?? ""));
    setAttachments(idea.attachments ?? []);
    setShowAddLink(false);
    setNewLink("");
  };

  const handleSaveBackToIdea = () => {
    if (!activeIdeaId) return;
    updateIdea(activeIdeaId, {
      text: editorBody,
      contentType: editorContentType,
      platforms: [editorPlatformToIdeaPlatform(editorPlatform)],
      attachments,
    });
  };

  const handleSaveAsNewIdea = () => {
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      text: editorBody,
      contentType: editorContentType,
      platforms: [editorPlatformToIdeaPlatform(editorPlatform)],
      status: "Ready",
      nextAction: "outline",
      energy: 3,
      createdAt: now,
      updatedAt: now,
      attachments,
      referenceTweets: [],
    };

    saveIdea(newIdea);
    setActiveIdeaId(newIdea.id);
  };

  const handleAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    mediaLibrary.addFromFiles(files, activeIdeaId ?? undefined);

    const next: IdeaAttachment[] = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      type: file.type.startsWith("video") ? "video" : "image",
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setAttachments((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const handleAddLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) return;

    const attachment: IdeaAttachment = {
      id: `${Date.now()}-link`,
      type: "link",
      url: trimmed,
      name: trimmed,
    };

    setAttachments((prev) => [...prev, attachment]);
    setNewLink("");
    setShowAddLink(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-4">
          <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xs text-slate-400 transition hover:text-slate-200">
            ← Back to Inbox
          </Link>
          <Link
            href="/media-library"
            className="text-xs text-slate-400 transition hover:text-slate-200"
          >
            Media library
          </Link>
          <div className="ml-auto text-right">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">Brain Forge</h1>
            <p className="text-xs text-slate-400">
              Vault for your cracked ideas. Draft, edit, and structure content in one place.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)_minmax(0,0.9fr)]">
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

          <section className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-4 sm:p-5 shadow-xl h-full flex flex-col gap-3">
            <input
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              placeholder="Working title (optional)"
              className="w-full bg-transparent text-base font-semibold text-slate-50 outline-none placeholder:text-slate-500"
            />

            <div className="flex flex-wrap gap-2 text-[11px]">
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
                    {platform === "x"
                      ? "X"
                      : platform.charAt(0).toUpperCase() + platform.slice(1)}
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

            <div className="flex flex-col gap-2 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                {platformConfig.editorLabel}
              </p>
              <textarea
                value={editorBody}
                onChange={(e) => setEditorBody(e.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm sm:text-[15px] leading-relaxed text-slate-100 outline-none resize-y min-h-[260px] md:min-h-[360px]"
                placeholder={platformConfig.editorPlaceholder}
              />
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-medium uppercase tracking-wide text-slate-300">Media</span>
                <span className="text-slate-500">{platformMediaHint}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-100 hover:border-sky-500">
                  <span>+ Image / Video</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleAddFiles}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowAddLink(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-100 hover:border-sky-500"
                >
                  + Link / Tweet / URL
                </button>
              </div>

              {showAddLink && (
                <div className="flex gap-2 pt-1">
                  <input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Paste a tweet, article, or media link…"
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-1.5 text-[11px] text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="rounded-xl bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-sky-400"
                  >
                    Add
                  </button>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2.5 py-1 text-[10px] text-slate-100"
                    >
                      <span className="uppercase text-[9px] text-slate-400">{a.type}</span>
                      <span className="max-w-[120px] truncate">
                        {a.name ?? a.url}
                      </span>

                      {/* Download button */}
                      {(a.type === "image" || a.type === "video" || a.type === "file") && (
                        <a
                          href={a.url}
                          download={a.name || undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-1 rounded-full bg-slate-700/80 px-1.5 py-0.5 text-[9px] text-slate-100 hover:bg-slate-600"
                          title="Download media"
                        >
                          ⬇
                        </a>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(a.id)}
                        className="ml-0.5 text-slate-400 hover:text-red-400"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
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
            <PlatformPreview
              platform={editorPlatform}
              title={editorTitle}
              body={editorBody}
              outline={outline}
              attachments={attachments}
            />

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Outline (optional)</h2>
              <p className="mt-1 text-[11px] text-slate-400">
                Jot a quick plan so your post doesn&apos;t feel all over the place.
              </p>
              <textarea
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                rows={8}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none"
                placeholder={platformConfig.outlinePlaceholder}
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
        initialAttachments={attachments}
        onClose={() => setHelperOpen(false)}
        onApplySuggestion={(newText) => {
          setEditorBody(newText);
          setHelperOpen(false);
        }}
      />
    </main>
  );
}
