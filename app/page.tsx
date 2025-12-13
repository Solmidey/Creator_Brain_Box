"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type DragEvent } from "react";
import AppHeader from "./components/AppHeader";
import HeroHeader from "./components/HeroHeader";
import { ContentHelperModal, type ContentHelperModalProps } from "./components/ContentHelperModal";
import { useSavedIdeas, type Idea } from "./hooks/useSavedIdeas";
import type {
  ContentType,
  EnergyLevel,
  Filters,
  IdeaStatus,
  IdeaAttachment,
  NextAction,
  Platform,
  Streak,
} from "./types/ideas";

const STORAGE_KEY = "creator-brain-inbox-v1";
const MAX_INLINE_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const STREAK_STORAGE_KEY = "creator-brain-streak";

const PLATFORM_OPTIONS: Platform[] = [
  "X",
  "LinkedIn",
  "Instagram",
  "YouTube",
  "Newsletter",
];

const STATUS_COLUMNS: IdeaStatus[] = ["Inbox", "Ready", "Drafting", "Posted"];

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: "hook", label: "Hook" },
  { value: "thread", label: "Thread" },
  { value: "carousel", label: "Carousel" },
  { value: "email", label: "Email" },
  { value: "script", label: "Script" },
  { value: "other", label: "Other" },
];

const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  brain_dump: "Brain dump",
  outline: "Outline",
  publish: "Publish",
};

function getISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function timeframeMatches(timeframe: Filters["timeframe"], createdAt: string) {
  if (!timeframe) return true;
  const created = new Date(createdAt);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (timeframe === "today") {
    return created >= startOfToday;
  }

  if (timeframe === "week") {
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7;
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - diffToMonday
    );
    return created >= startOfWeek;
  }
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const startOfWeek = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - diffToMonday
  );
  return created < startOfWeek; // someday
}

function filterIdeas(ideas: Idea[], filters: Filters) {
  return ideas.filter((idea) => {
    const platformMatch =
      filters.platforms.length === 0 ||
      idea.platforms.some((platform) => filters.platforms.includes(platform));

    const statusMatch =
      filters.statuses.length === 0 || filters.statuses.includes(idea.status);

    const timeframeMatch = timeframeMatches(filters.timeframe, idea.createdAt);

    return platformMatch && statusMatch && timeframeMatch;
  });
}

function getNextActionColor(action: NextAction) {
  switch (action) {
    case "brain_dump":
      return "bg-slate-200 text-slate-800 dark:bg-slate-800/70 dark:text-slate-100";
    case "outline":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100";
    case "publish":
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-100";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-100";
}

function inferAttachmentType(mimeType: string): IdeaAttachment["type"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "file";
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("msword") ||
    mimeType.includes("sheet")
  )
    return "file";
  return "other";
}

function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function Badge({ label, colorClasses }: { label: string; colorClasses: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}
    >
      {label}
    </span>
  );
}

function FilterPanel({
  filters,
  onTogglePlatform,
  onToggleStatus,
  onSelectTimeframe,
  onClear,
}: {
  filters: Filters;
  onTogglePlatform: (platform: Platform) => void;
  onToggleStatus: (status: IdeaStatus) => void;
  onSelectTimeframe: (timeframe: Filters["timeframe"]) => void;
  onClear: () => void;
}) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Filters</h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Platforms</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORM_OPTIONS.map((platform) => {
            const active = filters.platforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                onClick={() => onTogglePlatform(platform)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-sky-500 bg-sky-500 text-white dark:bg-sky-500 dark:text-white"
                    : "border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_COLUMNS.map((status) => {
            const active = filters.statuses.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => onToggleStatus(status)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-sky-500 bg-sky-500 text-white dark:bg-sky-500 dark:text-white"
                    : "border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Timeframe</p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { label: "Today", value: "today" },
              { label: "This Week", value: "week" },
              { label: "Someday", value: "someday" },
            ] as const
          ).map(({ label, value }) => {
            const active = filters.timeframe === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  onSelectTimeframe(active ? null : (value as Filters["timeframe"]))
                }
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-sky-500 bg-sky-500 text-white dark:bg-sky-500 dark:text-white"
                    : "border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AttachmentModal({
  open,
  attachments,
  onClose,
}: {
  open: boolean;
  attachments: IdeaAttachment[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Attachments</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
              >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{attachment.name ?? attachment.url}</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                {attachment.type.toUpperCase()} •
                {attachment.size ? ` ${(attachment.size / 1024).toFixed(0)} KB` : " Size unknown"}
              </p>
              {attachment.type === "image" && attachment.dataUrl ? (
                <Image
                  src={attachment.dataUrl}
                  alt={attachment.name ?? "Attachment image"}
                  width={800}
                  height={600}
                  unoptimized
                  className="mt-2 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-600 dark:text-slate-300">{attachment.mimeType}</span>
                  {attachment.dataUrl ? (
                    <a
                      href={attachment.dataUrl}
                      download={attachment.name}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="text-xs text-amber-600">Inline preview not saved</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddIdeaForm({
  onAddIdea,
}: {
  onAddIdea: (idea: Omit<Idea, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const [text, setText] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentType, setContentType] = useState<ContentType>("hook");
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [status, setStatus] = useState<IdeaStatus>("Inbox");
  const [nextAction, setNextAction] = useState<NextAction>("brain_dump");
  const [attachments, setAttachments] = useState<IdeaAttachment[]>([]);
  const [referenceTweets, setReferenceTweets] = useState<string[]>([]);
  const [tweetInput, setTweetInput] = useState("");
  const [tweetError, setTweetError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const processed = await Promise.all(
      fileArray.map(async (file) => {
        const type = inferAttachmentType(file.type);
        if (file.size <= MAX_INLINE_ATTACHMENT_SIZE) {
          const dataUrl = await readFileAsDataURL(file);
          return {
            id: crypto.randomUUID(),
            type,
            name: file.name,
            size: file.size,
            mimeType: file.type,
            dataUrl,
            url: dataUrl ?? file.name,
          } satisfies IdeaAttachment;
        }
        return {
          id: crypto.randomUUID(),
          type,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          url: file.name,
        } satisfies IdeaAttachment;
      })
    );
    setAttachments((prev) => [...prev, ...processed]);
  };

  const handleTweetAdd = () => {
    const trimmed = tweetInput.trim();
    if (!trimmed) return;
    if (
      trimmed.startsWith("http") &&
      (trimmed.includes("twitter.com") || trimmed.includes("x.com"))
    ) {
      setReferenceTweets((prev) => [...prev, trimmed]);
      setTweetInput("");
      setTweetError(null);
    } else {
      setTweetError("Please enter a valid Twitter/X link.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddIdea({
      text: text.trim(),
      platforms,
      contentType,
      energy,
      status,
      nextAction,
      attachments,
      referenceTweets,
    });
    setText("");
    setPlatforms([]);
    setContentType("hook");
    setEnergy(3);
    setStatus("Inbox");
    setNextAction("brain_dump");
    setAttachments([]);
    setReferenceTweets([]);
    setTweetInput("");
    setTweetError(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Add Idea</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Idea</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50 dark:placeholder:text-slate-500"
            rows={3}
            placeholder="Brain dump your thought..."
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Platforms</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((platform) => {
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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Content type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50"
            >
              {CONTENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Energy</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value) as EnergyLevel)}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">⚡{energy}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50"
            >
              {STATUS_COLUMNS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50">Next action</label>
            <select
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value as NextAction)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50"
            >
              <option value="brain_dump">Brain dump</option>
              <option value="outline">Outline</option>
              <option value="publish">Publish</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">Attachments</p>
            <input
              type="file"
              multiple
              onChange={(e) => {
                void handleFiles(e.target.files);
                e.target.value = "";
              }}
              className="text-xs"
            />
          </div>
          <div
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm transition ${
              isDragging
                ? "border-blue-400 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10"
                : "border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFiles(e.dataTransfer.files);
            }}
          >
            <p className="text-slate-700 dark:text-slate-200">Drag and drop files here, or use the picker.</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Up to 5MB per file for inline previews.</p>
          </div>
          {attachments.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
                >
                  {attachment.type === "image" && attachment.dataUrl ? (
                    <Image
                      src={attachment.dataUrl}
                      alt={attachment.name ?? "Attachment"}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                      {attachment.type === "video"
                        ? "VID"
                        : attachment.type === "image"
                          ? "IMG"
                          : attachment.type === "file"
                            ? "FILE"
                            : "LINK"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-50 truncate">{attachment.name ?? attachment.url}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : "Size unknown"}
                    </p>
                    {!attachment.dataUrl &&
                      attachment.size &&
                      attachment.size > MAX_INLINE_ATTACHMENT_SIZE && (
                      <p className="text-[11px] text-amber-600">Too large for inline preview; metadata saved only.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((item) => item.id !== attachment.id))
                    }
                    className="absolute right-2 top-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Reference tweets (optional)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={tweetInput}
              onChange={(e) => setTweetInput(e.target.value)}
              placeholder="https://twitter.com/..."
              className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-50 dark:placeholder:text-slate-500"
            />
            <button
              type="button"
              onClick={handleTweetAdd}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Add tweet
            </button>
          </div>
          {tweetError && <p className="text-xs text-amber-600">{tweetError}</p>}
          {referenceTweets.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {referenceTweets.map((link, index) => (
                <span
                  key={link}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:text-slate-200"
                >
                  {`Tweet ${index + 1}`}
                  <button
                    type="button"
                    onClick={() =>
                      setReferenceTweets((prev) => prev.filter((item) => item !== link))
                    }
                    className="text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Add to Inbox
          </button>
        </div>
      </form>
    </div>
  );
}

function IdeaCard({ idea, onAskHelper }: { idea: Idea; onAskHelper: (idea: Idea) => void }) {
  const [showAttachments, setShowAttachments] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", idea.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="group rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-sm transition-colors hover:border-sky-500/70 hover:bg-slate-900"
    >
      <p className="line-clamp-3 text-[11px] leading-snug text-slate-200">{idea.text}</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wide text-slate-500">
          {CONTENT_TYPES.find((c) => c.value === idea.contentType)?.label ?? idea.contentType} • {idea.platforms.join(", ")}
        </span>
        <button
          type="button"
          onClick={() => onAskHelper(idea)}
          className="rounded-full bg-sky-500 px-2 py-1 text-[10px] font-semibold text-white shadow-sm hover:bg-sky-400"
        >
          Ask helper
        </button>
      </div>

      {(idea.attachments?.length || idea.referenceTweets?.length) && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          {idea.attachments && idea.attachments.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAttachments(true)}
              className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-sky-500/70 hover:text-sky-100"
            >
              {idea.attachments.length} attachment{idea.attachments.length > 1 ? "s" : ""}
            </button>
          )}
          {idea.referenceTweets && idea.referenceTweets.length > 0 && (
            <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-200">
              {idea.referenceTweets.length} reference{idea.referenceTweets.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <AttachmentModal
        open={showAttachments}
        attachments={idea.attachments ?? []}
        onClose={() => setShowAttachments(false)}
      />
    </div>
  );
}

function StatusColumn({
  title,
  count,
  ideas,
  onDrop,
  onAskHelper,
}: {
  title: IdeaStatus;
  count: number;
  ideas: Idea[];
  onDrop: (id: string, status: IdeaStatus) => void;
  onAskHelper: (idea: Idea) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (id) {
      onDrop(id, title);
    }
    setIsOver(false);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-800/70 bg-slate-900/70 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-50">{title}</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[11px] font-medium text-slate-100">
            {count}
          </span>
        </div>
      </div>
      <div
        className={`mt-1 max-h-64 space-y-2 overflow-y-auto rounded-xl pr-1 transition-colors ${
          isOver ? "border border-sky-500/70 bg-slate-900" : "border border-transparent"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
      >
        {ideas.length === 0 ? (
          <p className="text-xs text-slate-500">Drop ideas here from other lists or add new ones.</p>
        ) : (
          ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} onAskHelper={onAskHelper} />)
        )}
      </div>
    </div>
  );
}

function IdeasBoard({
  ideas,
  onMoveIdea,
  onAskHelper,
}: {
  ideas: Idea[];
  onMoveIdea: (id: string, status: IdeaStatus) => void;
  onAskHelper: (idea: Idea) => void;
}) {
  const { inboxIdeas, readyIdeas, draftingIdeas, postedIdeas } = useMemo(() => {
    return {
      inboxIdeas: ideas.filter((idea) => idea.status === "Inbox"),
      readyIdeas: ideas.filter((idea) => idea.status === "Ready"),
      draftingIdeas: ideas.filter((idea) => idea.status === "Drafting"),
      postedIdeas: ideas.filter((idea) => idea.status === "Posted"),
    };
  }, [ideas]);

  return (
    <section className="mt-2 rounded-3xl border border-slate-800/60 bg-slate-950/70 px-4 py-5 shadow-xl dark:bg-slate-950/80">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-50">Ideas</h2>
          <p className="text-xs text-slate-400">See everything you’ve captured, grouped by status.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusColumn
          title="Inbox"
          count={inboxIdeas.length}
          ideas={inboxIdeas}
          onDrop={onMoveIdea}
          onAskHelper={onAskHelper}
        />
        <StatusColumn
          title="Ready"
          count={readyIdeas.length}
          ideas={readyIdeas}
          onDrop={onMoveIdea}
          onAskHelper={onAskHelper}
        />
        <StatusColumn
          title="Drafting"
          count={draftingIdeas.length}
          ideas={draftingIdeas}
          onDrop={onMoveIdea}
          onAskHelper={onAskHelper}
        />
        <StatusColumn
          title="Posted"
          count={postedIdeas.length}
          ideas={postedIdeas}
          onDrop={onMoveIdea}
          onAskHelper={onAskHelper}
        />
      </div>
    </section>
  );
}

function TodayFocusCard({ idea }: { idea: Idea }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <p className="overflow-hidden break-words text-sm text-slate-800 dark:text-slate-100">{idea.text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <Badge label={`⚡${idea.energy}`} colorClasses="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100" />
        <Badge
          label={CONTENT_TYPES.find((c) => c.value === idea.contentType)?.label ?? idea.contentType}
          colorClasses="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100"
        />
        {idea.platforms.slice(0, 3).map((platform) => (
          <Badge
            key={platform}
            label={platform}
            colorClasses="bg-slate-100 text-slate-700 dark:bg-slate-800/70 dark:text-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

function StreakCard({ streak }: { streak: Streak }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-50 p-4 shadow-sm backdrop-blur dark:border-amber-500/40 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-amber-800/40">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Idea streak</p>
      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{streak.currentStreak} day{streak.currentStreak === 1 ? "" : "s"} 🔥</p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-200">Keep adding ideas daily to keep the fire going.</p>
    </div>
  );
}

export default function HomePage() {
  const { savedIdeas: ideas, saveIdea, updateIdea } = useSavedIdeas();
  const [filters, setFilters] = useState<Filters>({ platforms: [], statuses: [], timeframe: null });
  const [streak, setStreak] = useState<Streak>({ currentStreak: 0, lastIdeaDate: null });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [helperInitialText, setHelperInitialText] = useState("");
  const [helperInitialPlatform, setHelperInitialPlatform] = useState<
    ContentHelperModalProps["initialPlatform"]
  >();
  const [helperInitialReferenceTweets, setHelperInitialReferenceTweets] = useState<string[]>([]);
  const [helperInitialAttachments, setHelperInitialAttachments] = useState<IdeaAttachment[]>([]);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STREAK_STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as Streak;
        setStreak(parsed);
      }
    } catch (error) {
      console.error("Failed to load streak", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = setTimeout(() => {
      const payload = JSON.stringify(streak);
      localStorage.setItem(STREAK_STORAGE_KEY, payload);
    }, 300);
    return () => clearTimeout(handler);
  }, [streak]);

  const updateStreakForDate = (date: Date) => {
    const dateKey = getISODate(date);

    setStreak((prev) => {
      if (prev.lastIdeaDate === dateKey) return prev;

      const yesterday = getISODate(new Date(date.getTime() - 1000 * 60 * 60 * 24));

      if (prev.lastIdeaDate === yesterday) {
        return { currentStreak: prev.currentStreak + 1, lastIdeaDate: dateKey };
      }

      return { currentStreak: 1, lastIdeaDate: dateKey };
    });
  };

  const addIdea = (ideaInput: Omit<Idea, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const isoDate = now.toISOString();
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      createdAt: isoDate,
      updatedAt: isoDate,
      ...ideaInput,
      attachments: ideaInput.attachments ?? [],
      referenceTweets: ideaInput.referenceTweets ?? [],
    };

    saveIdea(newIdea);
    updateStreakForDate(now);
  };

  const handleHelperIdeaSaved = (idea: Idea) => {
    updateStreakForDate(new Date(idea.createdAt));
  };

  const moveIdea = (id: string, status: IdeaStatus) => updateIdea(id, { status });

  const updateIdeaText = (id: string, text: string) => {
    updateIdea(id, { text });
  };

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);

  const focusIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.status === "Ready" || idea.status === "Drafting")
      .sort((a, b) => b.energy - a.energy || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [ideas]);

  const clearFilters = () => setFilters({ platforms: [], statuses: [], timeframe: null });

  const mapPlatformToHelperPlatform = (
    platform?: Platform,
  ): ContentHelperModalProps["initialPlatform"] => {
    switch (platform) {
      case "X":
        return "x";
      case "LinkedIn":
        return "linkedin";
      case "Instagram":
        return "instagram";
      case "YouTube":
        return "youtube";
      case "Newsletter":
        return "newsletter";
      default:
        return undefined;
    }
  };

  const openHelper = (idea?: Idea) => {
    setActiveIdeaId(idea?.id ?? null);
    setHelperInitialText(idea?.text ?? "");
    setHelperInitialPlatform(mapPlatformToHelperPlatform(idea?.platforms[0]));
    setHelperInitialReferenceTweets(idea?.referenceTweets ?? []);
    setHelperInitialAttachments(idea?.attachments ?? []);
    setHelperOpen(true);
  };

  const handleApplySuggestion = (newText: string) => {
    if (activeIdeaId) {
      updateIdeaText(activeIdeaId, newText);
    }
    setHelperOpen(false);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-sky-100/60 px-0 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-sky-900/40">
      <div className="pointer-events-none absolute left-8 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-500/30 blur-3xl dark:bg-sky-500/40" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-600/20" />

      <main className="relative mx-auto max-w-6xl space-y-6 px-4">
        <AppHeader />
        <HeroHeader onOpenHelper={() => openHelper()} />

        {/* Mobile: focus + streak */}
        <div className="space-y-3 md:hidden">
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Today&apos;s Focus</h3>
                <span className="text-xs text-slate-500 dark:text-slate-300">Top 3</span>
              </div>
              {focusIdeas.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-200">No focus ideas yet — move something to Ready or Drafting.</p>
              ) : (
                <div className="space-y-2">
                  {focusIdeas.map((idea) => (
                    <TodayFocusCard key={idea.id} idea={idea} />
                  ))}
                </div>
              )}
            </div>
            <StreakCard streak={streak} />
          </div>
        </div>

        {/* Desktop grid */}
        <div className="grid gap-6 md:grid-cols-[260px,minmax(0,1fr),280px]">
          <div className="hidden md:block">
            <FilterPanel
              filters={filters}
              onTogglePlatform={(platform) =>
                setFilters((prev) => ({
                  ...prev,
                  platforms: prev.platforms.includes(platform)
                    ? prev.platforms.filter((p) => p !== platform)
                    : [...prev.platforms, platform],
                }))
              }
              onToggleStatus={(status) =>
                setFilters((prev) => ({
                  ...prev,
                  statuses: prev.statuses.includes(status)
                    ? prev.statuses.filter((s) => s !== status)
                    : [...prev.statuses, status],
                }))
              }
              onSelectTimeframe={(timeframe) => setFilters((prev) => ({ ...prev, timeframe }))}
              onClear={clearFilters}
            />
          </div>

          <div className="space-y-4">
            <AddIdeaForm onAddIdea={addIdea} />

            {/* Mobile filters trigger */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setShowMobileFilters((prev) => !prev)}
                className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-50 shadow-sm backdrop-blur"
              >
                {showMobileFilters ? "Hide filters" : "Show filters"}
              </button>
              {showMobileFilters && (
                <FilterPanel
                  filters={filters}
                  onTogglePlatform={(platform) =>
                    setFilters((prev) => ({
                      ...prev,
                      platforms: prev.platforms.includes(platform)
                        ? prev.platforms.filter((p) => p !== platform)
                        : [...prev.platforms, platform],
                    }))
                  }
                  onToggleStatus={(status) =>
                    setFilters((prev) => ({
                      ...prev,
                      statuses: prev.statuses.includes(status)
                        ? prev.statuses.filter((s) => s !== status)
                        : [...prev.statuses, status],
                    }))
                  }
                  onSelectTimeframe={(timeframe) => setFilters((prev) => ({ ...prev, timeframe }))}
                  onClear={clearFilters}
                />
              )}
            </div>

            <IdeasBoard ideas={filteredIdeas} onMoveIdea={moveIdea} onAskHelper={openHelper} />
          </div>

          <div className="hidden space-y-4 md:block">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Today&apos;s Focus</h3>
                <span className="text-xs text-slate-500 dark:text-slate-300">Top 3</span>
              </div>
              {focusIdeas.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-200">No focus ideas yet — move something to Ready or Drafting.</p>
              ) : (
                <div className="space-y-2">
                  {focusIdeas.map((idea) => (
                    <TodayFocusCard key={idea.id} idea={idea} />
                  ))}
                </div>
              )}
            </div>
            <StreakCard streak={streak} />
          </div>
        </div>

        <ContentHelperModal
          open={helperOpen}
          initialText={helperInitialText}
          initialPlatform={helperInitialPlatform}
          initialReferenceTweets={helperInitialReferenceTweets}
          initialAttachments={helperInitialAttachments}
          onClose={() => setHelperOpen(false)}
          onSaveIdea={handleHelperIdeaSaved}
          onApplySuggestion={handleApplySuggestion}
        />
      </main>
    </div>
  );
}
