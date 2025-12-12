"use client";

import { useEffect, useMemo, useState } from "react";

type Platform = "X" | "LinkedIn" | "Instagram" | "YouTube" | "Newsletter";
type ContentType = "hook" | "thread" | "carousel" | "email" | "script" | "other";
type Status = "Inbox" | "Ready" | "Drafting" | "Posted";
type NextAction = "brain_dump" | "outline" | "publish";

type Idea = {
  id: string;
  text: string;
  platforms: Platform[];
  contentType: ContentType;
  energy: 1 | 2 | 3 | 4 | 5;
  status: Status;
  nextAction: NextAction;
  createdAt: string;
};

type Filters = {
  platforms: Platform[];
  statuses: Status[];
  timeframe: "today" | "week" | "someday" | null;
};

type Streak = {
  currentStreak: number;
  lastIdeaDate: string | null; // YYYY-MM-DD
};

const STORAGE_KEY = "creator-brain-inbox-v1";

const PLATFORM_OPTIONS: Platform[] = [
  "X",
  "LinkedIn",
  "Instagram",
  "YouTube",
  "Newsletter",
];

const STATUS_COLUMNS: Status[] = ["Inbox", "Ready", "Drafting", "Posted"];

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
  onToggleStatus: (status: Status) => void;
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
                  onSelectTimeframe(active ? null : value as Filters["timeframe"])
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

function AddIdeaForm({
  onAddIdea,
}: {
  onAddIdea: (idea: Omit<Idea, "id" | "createdAt">) => void;
}) {
  const [text, setText] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [contentType, setContentType] = useState<ContentType>("hook");
  const [energy, setEnergy] = useState<Idea["energy"]>(3);
  const [status, setStatus] = useState<Status>("Inbox");
  const [nextAction, setNextAction] = useState<NextAction>("brain_dump");

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onAddIdea({ text: text.trim(), platforms, contentType, energy, status, nextAction });
    setText("");
    setPlatforms([]);
    setContentType("hook");
    setEnergy(3);
    setStatus("Inbox");
    setNextAction("brain_dump");
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Add Idea</h2>
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
                onChange={(e) => setEnergy(Number(e.target.value) as Idea["energy"])}
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
              onChange={(e) => setStatus(e.target.value as Status)}
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

function IdeaCard({ idea }: { idea: Idea }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", idea.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <p className="text-sm text-slate-900 mb-3 break-words overflow-hidden">
        {idea.text}
      </p>
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
    </div>
  );
}

function IdeaColumn({
  status,
  ideas,
  onDrop,
}: {
  status: Status;
  ideas: Idea[];
  onDrop: (id: string, status: Status) => void;
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
        ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
      )}
    </div>
  );
}

function IdeaBoard({ ideas, onMoveIdea }: { ideas: Idea[]; onMoveIdea: (id: string, status: Status) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      {STATUS_COLUMNS.map((status) => (
        <IdeaColumn
          key={status}
          status={status}
          ideas={ideas.filter((idea) => idea.status === status)}
          onDrop={onMoveIdea}
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

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { ideas?: Idea[]; streak?: Streak };
        setIdeas(parsed.ideas && parsed.ideas.length > 0 ? parsed.ideas : getSeedIdeas());
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

  const moveIdea = (id: string, status: Status) => {
    setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status } : idea)));
  };

  const filteredIdeas = useMemo(() => filterIdeas(ideas, filters), [ideas, filters]);

  const focusIdeas = useMemo(() => {
    return ideas
      .filter((idea) => idea.status === "Ready" || idea.status === "Drafting")
      .sort((a, b) => b.energy - a.energy || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [ideas]);

  const clearFilters = () => setFilters({ platforms: [], statuses: [], timeframe: null });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
                  : [...prev, platform],
              }))
            }
            onToggleStatus={(status) =>
              setFilters((prev) => ({
                ...prev,
                statuses: prev.statuses.includes(status)
                  ? prev.statuses.filter((s) => s !== status)
                  : [...prev, status],
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
                      : [...prev, platform],
                  }))
                }
                onToggleStatus={(status) =>
                  setFilters((prev) => ({
                    ...prev,
                    statuses: prev.statuses.includes(status)
                      ? prev.statuses.filter((s) => s !== status)
                      : [...prev, status],
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
            <IdeaBoard ideas={filteredIdeas} onMoveIdea={moveIdea} />
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
    </main>
  );
}
