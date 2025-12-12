"use client";

import { useEffect, useMemo, useState } from "react";

type Platform = "X" | "LinkedIn" | "Instagram" | "YouTube" | "Newsletter";
type ContentType = "hook" | "thread" | "carousel" | "email" | "script" | "other";
type EnergyLevel = 1 | 2 | 3 | 4 | 5;
type IdeaStatus = "Inbox" | "Ready" | "Drafting" | "Posted";
type NextAction = "brain_dump" | "outline" | "publish";

type AttachmentType = "image" | "video" | "audio" | "document" | "other";

type Attachment = {
  id: string;
  type: AttachmentType;
  name: string;
  size: number;
  mimeType: string;
  dataUrl?: string;
};

type Idea = {
  id: string;
  text: string;
  platforms: Platform[];
  contentType: ContentType;
  energy: EnergyLevel;
  status: IdeaStatus;
  nextAction: NextAction;
  createdAt: string;
  attachments?: Attachment[];
  referenceTweets?: string[];
};

type Filters = {
  platforms: Platform[];
  statuses: IdeaStatus[];
  timeframe: "today" | "week" | "someday" | null;
};

type Streak = {
  currentStreak: number;
  lastIdeaDate: string | null; // YYYY-MM-DD
};

type ContentHelperMode =
  | "polish"
  | "thread"
  | "linkedin"
  | "hooks"
  | "outline";

const STORAGE_KEY = "creator-brain-inbox-v1";
const MAX_INLINE_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB

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

const HELPER_PLATFORM_OPTIONS: Platform[] = ["X", "LinkedIn", "Instagram", "Newsletter"];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getSeedIdeas(): Idea[] {
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
      return "bg-slate-200 text-slate-800";
    case "outline":
      return "bg-blue-100 text-blue-700";
    case "publish":
      return "bg-green-100 text-green-700";
  }
  return "bg-slate-100 text-slate-700";
}

function inferAttachmentType(mimeType: string): AttachmentType {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("msword") ||
    mimeType.includes("sheet")
  )
    return "document";
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

function normalizeIdea(idea: Idea): Idea {
  return {
    ...idea,
    attachments: idea.attachments ?? [],
    referenceTweets: idea.referenceTweets ?? [],
  };
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
    <div className="space-y-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={onClear}
          type="button"
        >
          Clear
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Platforms</p>
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
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                {platform}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Status</p>
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Timeframe</p>
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
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
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

function AttachmentStrip({
  attachments,
  onOpen,
}: {
  attachments: Attachment[];
  onOpen: () => void;
}) {
  const preview = attachments.slice(0, 3);
  const remaining = attachments.length - preview.length;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50"
    >
      {preview.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-1 rounded-md bg-white px-2 py-1 shadow-inner"
        >
          {attachment.type === "image" && attachment.dataUrl ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <span className="text-[11px] font-semibold text-slate-600">
              {attachment.type === "document"
                ? "DOC"
                : attachment.type === "video"
                  ? "VID"
                  : attachment.type === "audio"
                    ? "AUD"
                    : "FILE"}
            </span>
          )}
          <span className="text-[11px] text-slate-600 truncate max-w-[80px]">
            {attachment.name}
          </span>
        </div>
      ))}
      {remaining > 0 && (
        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-inner">
          +{remaining}
        </span>
      )}
    </button>
  );
}

function AttachmentModal({
  open,
  attachments,
  onClose,
}: {
  open: boolean;
  attachments: Attachment[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-800 truncate">{attachment.name}</p>
              <p className="text-xs text-slate-500">
                {attachment.type.toUpperCase()} • {(attachment.size / 1024).toFixed(0)} KB
              </p>
              {attachment.type === "image" && attachment.dataUrl ? (
                <img
                  src={attachment.dataUrl}
                  alt={attachment.name}
                  className="mt-2 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-600">{attachment.mimeType}</span>
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

function ContentHelperModal({
  isOpen,
  onClose,
  seedIdea,
  onSaveIdea,
  onReplaceIdea,
}: {
  isOpen: boolean;
  onClose: () => void;
  seedIdea?: Idea;
  onSaveIdea: (payload: Omit<Idea, "id" | "createdAt">) => void;
  onReplaceIdea?: (id: string, text: string) => void;
}) {
  const [mode, setMode] = useState<ContentHelperMode>("polish");
  const [text, setText] = useState(seedIdea?.text ?? "");
  const [platforms, setPlatforms] = useState<Platform[]>(seedIdea?.platforms ?? []);
  const [includeReferences, setIncludeReferences] = useState(true);
  const [contentType, setContentType] = useState<ContentType>(seedIdea?.contentType ?? "hook");
  const [energy, setEnergy] = useState<EnergyLevel>(seedIdea?.energy ?? 3);
  const [suggestion, setSuggestion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setText(seedIdea?.text ?? "");
      setPlatforms(seedIdea?.platforms ?? []);
      setContentType(seedIdea?.contentType ?? "hook");
      setEnergy(seedIdea?.energy ?? 3);
      setIncludeReferences(true);
      setSuggestion("");
      setError(null);
      setMode("polish");
    }
  }, [isOpen, seedIdea]);

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const submitHelper = async () => {
    setLoading(true);
    setError(null);
    setSuggestion("");
    try {
  
// 1) Log the payload (no await, no const)
console.log("Helper payload:", {
  mode,
  ideaText: text,
  contentType,
  energy,
  referenceTweets: [],      // ✅ inline default
  attachmentsSummary: "",   // ✅ inline default
});

const response = await fetch("/api/helper", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    mode,                    // e.g. "polish" | "x_thread"
    ideaText: text.trim(),   // main text
    contentType,
    energy,
    referenceTweets: [],      // send empty list for now
    attachmentsSummary: "",   // send empty summary
  }),
});

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(
          data?.error === "AI helper not configured"
            ? "AI helper isn’t configured yet. Add your API key on Vercel to enable it."
            : "Unable to fetch suggestion right now."
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

  const handleSave = () => {
    if (!suggestion.trim()) return;
    onSaveIdea({
      text: suggestion.trim(),
      platforms,
      contentType,
      energy,
      status: "Inbox",
      nextAction: "brain_dump",
      attachments: [],
      referenceTweets: seedIdea?.referenceTweets ?? [],
    });
    onClose();
  };

  const handleReplace = () => {
    if (seedIdea && suggestion.trim() && onReplaceIdea) {
      onReplaceIdea(seedIdea.id, suggestion.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Content Helper</h3>
            <p className="text-sm text-slate-600">AI-powered assistance for polishing your idea.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-[1fr,1fr]">
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700">Mode</label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Polish this post", value: "polish" },
                { label: "Turn into X thread", value: "thread" },
                { label: "Turn into LinkedIn post", value: "linkedin" },
                { label: "Generate 5 hooks", value: "hooks" },
                { label: "Outline this idea", value: "outline" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value as ContentHelperMode)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    mode === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Idea text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Paste your idea here"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Platforms</p>
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
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {platform}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
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
                <label className="text-xs font-semibold text-slate-700">Content type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as ContentType)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {CONTENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Energy</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={energy}
                    onChange={(e) => setEnergy(Number(e.target.value) as EnergyLevel)}
                    className="flex-1"
                  />
                  <span className="text-xs font-semibold text-slate-800">⚡{energy}</span>
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
              <p className="text-sm font-semibold text-slate-800">Suggestion</p>
              <div className="min-h-[160px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
                {suggestion || "No suggestion yet."}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!suggestion}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300 disabled:opacity-50"
                >
                  Copy suggestion
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!suggestion}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm hover:border-blue-300 disabled:opacity-50"
                >
                  Save as new idea
                </button>
                {seedIdea && onReplaceIdea && (
                  <button
                    type="button"
                    onClick={handleReplace}
                    disabled={!suggestion}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm hover:border-emerald-300 disabled:opacity-50"
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

function AddIdeaForm({
  onAddIdea,
}: {
  onAddIdea: (idea: Omit<Idea, "id" | "createdAt">) => void;
}) {
  const [text, setText] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentType, setContentType] = useState<ContentType>("hook");
  const [energy, setEnergy] = useState<EnergyLevel>(3);
  const [status, setStatus] = useState<IdeaStatus>("Inbox");
  const [nextAction, setNextAction] = useState<NextAction>("brain_dump");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
          } satisfies Attachment;
        }
        return {
          id: crypto.randomUUID(),
          type,
          name: file.name,
          size: file.size,
          mimeType: file.type,
        } satisfies Attachment;
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
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Add Idea</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Idea</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            rows={3}
            placeholder="Brain dump your thought..."
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Platforms</p>
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
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
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
            <label className="text-sm font-medium text-slate-700">Content type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {CONTENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Energy</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={5}
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value) as EnergyLevel)}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-slate-800">⚡{energy}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IdeaStatus)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {STATUS_COLUMNS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Next action</label>
            <select
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value as NextAction)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="brain_dump">Brain dump</option>
              <option value="outline">Outline</option>
              <option value="publish">Publish</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">Attachments</p>
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
              isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50"
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
            <p className="text-slate-700">Drag and drop files here, or use the picker.</p>
            <p className="text-xs text-slate-500">Up to 5MB per file for inline previews.</p>
          </div>
          {attachments.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                >
                  {attachment.type === "image" && attachment.dataUrl ? (
                    <img
                      src={attachment.dataUrl}
                      alt={attachment.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-600">
                      {attachment.type === "document"
                        ? "DOC"
                        : attachment.type === "video"
                          ? "VID"
                          : attachment.type === "audio"
                            ? "AUD"
                            : "FILE"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(0)} KB</p>
                    {!attachment.dataUrl && attachment.size > MAX_INLINE_ATTACHMENT_SIZE && (
                      <p className="text-[11px] text-amber-600">Too large for inline preview; metadata saved only.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((item) => item.id !== attachment.id))
                    }
                    className="absolute right-2 top-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Reference tweets (optional)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              value={tweetInput}
              onChange={(e) => setTweetInput(e.target.value)}
              placeholder="https://twitter.com/..."
              className="flex-1 rounded-xl border border-slate-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {`Tweet ${index + 1}`}
                  <button
                    type="button"
                    onClick={() =>
                      setReferenceTweets((prev) => prev.filter((item) => item !== link))
                    }
                    className="text-slate-500 hover:text-slate-700"
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
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-900 mb-3 break-words overflow-hidden flex-1">
          {idea.text}
        </p>
        <button
          type="button"
          onClick={() => onAskHelper(idea)}
          className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
        >
          Ask Helper
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        {idea.platforms.map((platform) => (
          <Badge
            key={platform}
            label={platform}
            colorClasses="bg-slate-100 text-slate-700"
          />
        ))}
        <Badge
          label={CONTENT_TYPES.find((c) => c.value === idea.contentType)?.label ?? idea.contentType}
          colorClasses="bg-amber-100 text-amber-700"
        />
        <Badge label={`⚡${idea.energy}`} colorClasses="bg-indigo-100 text-indigo-700" />
        <Badge label={NEXT_ACTION_LABELS[idea.nextAction]} colorClasses={getNextActionColor(idea.nextAction)} />
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Created {formatDate(idea.createdAt)}</p>

      {idea.attachments && idea.attachments.length > 0 && (
        <AttachmentStrip attachments={idea.attachments} onOpen={() => setShowAttachments(true)} />
      )}

      {idea.referenceTweets && idea.referenceTweets.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-semibold text-slate-700">References:</span>
          {idea.referenceTweets.map((link, index) => (
            <a
              key={link}
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-200"
            >
              {`Tweet #${index + 1}`}
            </a>
          ))}
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

function IdeaColumn({
  status,
  ideas,
  onDrop,
  onAskHelper,
}: {
  status: IdeaStatus;
  ideas: Idea[];
  onDrop: (id: string, status: IdeaStatus) => void;
  onAskHelper: (idea: Idea) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) {
          onDrop(id, status);
        }
        setIsOver(false);
      }}
      className={`flex min-h-[120px] flex-col gap-3 rounded-2xl border p-3 transition ${
        isOver ? "border-blue-400 bg-blue-50/40" : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">{status}</p>
        <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-600 shadow-sm">
          {ideas.length}
        </span>
      </div>
      {ideas.length === 0 ? (
        <p className="text-xs text-slate-500">Drop an idea here</p>
      ) : (
        ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} onAskHelper={onAskHelper} />)
      )}
    </div>
  );
}

function IdeaBoard({
  ideas,
  onMoveIdea,
  onAskHelper,
}: {
  ideas: Idea[];
  onMoveIdea: (id: string, status: IdeaStatus) => void;
  onAskHelper: (idea: Idea) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {STATUS_COLUMNS.map((status) => (
        <IdeaColumn
          key={status}
          status={status}
          ideas={ideas.filter((idea) => idea.status === status)}
          onDrop={onMoveIdea}
          onAskHelper={onAskHelper}
        />
      ))}
    </div>
  );
}

function TodayFocusCard({ idea }: { idea: Idea }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-sm text-slate-900 break-words overflow-hidden">{idea.text}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <Badge label={`⚡${idea.energy}`} colorClasses="bg-indigo-100 text-indigo-700" />
        <Badge
          label={CONTENT_TYPES.find((c) => c.value === idea.contentType)?.label ?? idea.contentType}
          colorClasses="bg-amber-100 text-amber-700"
        />
        {idea.platforms.slice(0, 3).map((platform) => (
          <Badge key={platform} label={platform} colorClasses="bg-slate-100 text-slate-700" />
        ))}
      </div>
    </div>
  );
}

function StreakCard({ streak }: { streak: Streak }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-50 p-4 shadow-sm border border-amber-200">
      <p className="text-sm font-semibold text-amber-800">Idea streak</p>
      <p className="text-3xl font-bold text-amber-900 mt-1">{streak.currentStreak} day{streak.currentStreak === 1 ? "" : "s"} 🔥</p>
      <p className="text-xs text-amber-800 mt-1">Keep adding ideas daily to keep the fire going.</p>
    </div>
  );
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState<Filters>({ platforms: [], statuses: [], timeframe: null });
  const [streak, setStreak] = useState<Streak>({ currentStreak: 0, lastIdeaDate: null });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [helperOpen, setHelperOpen] = useState(false);
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { ideas?: Idea[]; streak?: Streak };
        const hydratedIdeas = parsed.ideas && parsed.ideas.length > 0
          ? parsed.ideas.map(normalizeIdea)
          : getSeedIdeas();
        setIdeas(hydratedIdeas);
        if (parsed.streak) {
          setStreak(parsed.streak);
        } else {
          setStreak({ currentStreak: 0, lastIdeaDate: null });
        }
      } else {
        setIdeas(getSeedIdeas());
      }
    } catch (error) {
      console.error("Failed to load from storage", error);
      setIdeas(getSeedIdeas());
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const handler = setTimeout(() => {
      const payload = JSON.stringify({ ideas, streak });
      localStorage.setItem(STORAGE_KEY, payload);
    }, 300);
    return () => clearTimeout(handler);
  }, [ideas, streak, isClient]);

  const addIdea = (ideaInput: Omit<Idea, "id" | "createdAt">) => {
    const now = new Date();
    const isoDate = now.toISOString();
    const dateKey = getISODate(now);
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      createdAt: isoDate,
      ...ideaInput,
      attachments: ideaInput.attachments ?? [],
      referenceTweets: ideaInput.referenceTweets ?? [],
    };

    setIdeas((prev) => [newIdea, ...prev]);

    setStreak((prev) => {
      if (prev.lastIdeaDate === dateKey) return prev;
      const yesterday = getISODate(new Date(now.getTime() - 1000 * 60 * 60 * 24));
      if (prev.lastIdeaDate === yesterday) {
        return { currentStreak: prev.currentStreak + 1, lastIdeaDate: dateKey };
      }
      return { currentStreak: 1, lastIdeaDate: dateKey };
    });
  };

  const moveIdea = (id: string, status: IdeaStatus) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
  };

  const updateIdeaText = (id: string, text: string) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, text } : idea)));
  };

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);

  const focusIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.status === "Ready" || idea.status === "Drafting")
      .sort((a, b) => b.energy - a.energy || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [ideas]);

  const clearFilters = () => setFilters({ platforms: [], statuses: [], timeframe: null });

  const openHelper = (idea?: Idea) => {
    setActiveIdeaId(idea?.id ?? null);
    setHelperOpen(true);
  };

  const activeIdea = ideas.find((idea) => idea.id === activeIdeaId);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => openHelper()}
          className="rounded-full bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100"
        >
          Open Helper
        </button>
      </div>

      {/* Mobile: focus + streak */}
      <div className="md:hidden space-y-3">
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900">Today&apos;s Focus</h3>
              <span className="text-xs text-slate-500">Top 3</span>
            </div>
            {focusIdeas.length === 0 ? (
              <p className="text-sm text-slate-600">No focus ideas yet — move something to Ready or Drafting.</p>
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
              className="mb-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm border border-slate-200"
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

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Ideas</h3>
              <p className="text-sm text-slate-500">Drag between columns to update status</p>
            </div>
            <IdeaBoard ideas={filteredIdeas} onMoveIdea={moveIdea} onAskHelper={openHelper} />
          </div>
        </div>

        <div className="hidden space-y-4 md:block">
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-900">Today&apos;s Focus</h3>
              <span className="text-xs text-slate-500">Top 3</span>
            </div>
            {focusIdeas.length === 0 ? (
              <p className="text-sm text-slate-600">No focus ideas yet — move something to Ready or Drafting.</p>
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
        isOpen={helperOpen}
        onClose={() => setHelperOpen(false)}
        seedIdea={activeIdea}
        onSaveIdea={addIdea}
        onReplaceIdea={updateIdeaText}
      />
    </main>
  );
}
