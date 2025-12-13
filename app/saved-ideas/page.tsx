"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

import { ContentHelperModal, type ContentHelperModalProps } from "../components/ContentHelperModal";
import { useSavedIdeas, type Idea } from "../hooks/useSavedIdeas";

const STATUS_OPTIONS: Idea["status"][] = ["Inbox", "Ready", "Drafting", "Posted"];
const NEXT_ACTION_OPTIONS: Idea["nextAction"][] = ["brain_dump", "outline", "publish"];

const mapPlatformToHelperPlatform = (
  platform?: Idea["platforms"][number],
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

type SavedIdeaCardProps = {
  idea: Idea;
  onDelete: () => void;
  onOpenHelper: () => void;
  onChange: (patch: Partial<Idea>) => void;
};

function SavedIdeaCard({ idea, onDelete, onOpenHelper, onChange }: SavedIdeaCardProps) {
  const [localText, setLocalText] = useState(idea.text);
  const [localStatus, setLocalStatus] = useState(idea.status);
  const [localNextAction, setLocalNextAction] = useState(idea.nextAction);

  useEffect(() => {
    setLocalText(idea.text);
  }, [idea.text]);

  useEffect(() => {
    setLocalStatus(idea.status);
  }, [idea.status]);

  useEffect(() => {
    setLocalNextAction(idea.nextAction);
  }, [idea.nextAction]);

  const commitText = () => {
    onChange({ text: localText.trim() });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <textarea
        className="mb-3 h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={commitText}
        placeholder="Edit your idea"
      />

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="space-y-1">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Status
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            value={localStatus}
            onChange={(e) => {
              setLocalStatus(e.target.value as Idea["status"]);
              onChange({ status: e.target.value as Idea["status"] });
            }}
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Next action
          </label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            value={localNextAction}
            onChange={(e) => {
              setLocalNextAction(e.target.value as Idea["nextAction"]);
              onChange({ nextAction: e.target.value as Idea["nextAction"] });
            }}
          >
            {NEXT_ACTION_OPTIONS.map((action) => (
              <option key={action} value={action}>
                {action === "brain_dump" ? "Brain dump" : action === "outline" ? "Outline" : "Publish"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400">
          <span>Updated {new Date(idea.updatedAt).toLocaleDateString()}</span>
          <span className="text-slate-400 dark:text-slate-500">Platforms: {idea.platforms.join(", ") || "None"}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onOpenHelper}
            className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-sky-600"
          >
            Use helper
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavedIdeasPage() {
  const { savedIdeas, updateIdea, deleteIdea } = useSavedIdeas();
  const [helperOpen, setHelperOpen] = useState(false);
  const [helperIdeaId, setHelperIdeaId] = useState<string | null>(null);
  const [helperInitialText, setHelperInitialText] = useState("");
  const [helperInitialPlatform, setHelperInitialPlatform] = useState<
    ContentHelperModalProps["initialPlatform"]
  >();

  const sortedIdeas = [...savedIdeas].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  const openHelperForIdea = (id: string, text: string, platform?: Idea["platforms"][number]) => {
    setHelperIdeaId(id);
    setHelperInitialText(text);
    setHelperInitialPlatform(mapPlatformToHelperPlatform(platform));
    setHelperOpen(true);
  };

  const handleApplySuggestion = (newText: string) => {
    if (!helperIdeaId) return;
    updateIdea(helperIdeaId, { text: newText });
    setHelperOpen(false);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-sky-100/60 px-0 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-sky-900/40">
      <div className="pointer-events-none absolute left-8 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-500/30 blur-3xl dark:bg-sky-500/40" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-600/20" />

      <main className="relative mx-auto max-w-6xl space-y-6 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Saved ideas</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Revisit, edit, and prune your brain inbox.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            ← Back to Inbox
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Your saved ideas</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Edit status, next actions, or text directly in these cards.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedIdeas.map((idea) => (
              <SavedIdeaCard
                key={idea.id}
                idea={idea}
                onDelete={() => deleteIdea(idea.id)}
                onOpenHelper={() => openHelperForIdea(idea.id, idea.text, idea.platforms[0])}
                onChange={(patch) => updateIdea(idea.id, patch)}
              />
            ))}
            {sortedIdeas.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No saved ideas yet. Capture something from the Inbox to see it here.
              </p>
            )}
          </div>
        </div>
      </main>

      <ContentHelperModal
        open={helperOpen}
        initialText={helperInitialText}
        initialPlatform={helperInitialPlatform}
        onClose={() => setHelperOpen(false)}
        onApplySuggestion={handleApplySuggestion}
      />
    </div>
  );
}
