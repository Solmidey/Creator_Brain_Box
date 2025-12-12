"use client";

import Link from "next/link";
import { useMemo } from "react";
import Logo from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { TiltCard } from "../components/TiltCard";
import { useSavedIdeas } from "../hooks/useSavedIdeas";
import type { Idea, NextAction } from "../types/ideas";

const NEXT_ACTION_LABELS: Record<NextAction, string> = {
  brain_dump: "Brain dump",
  outline: "Outline",
  publish: "Publish",
};

const CONTENT_TYPE_LABELS: Record<Idea["contentType"], string> = {
  hook: "Hook",
  thread: "Thread",
  carousel: "Carousel",
  email: "Email",
  script: "Script",
  other: "Other",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function getNextActionColor(action: NextAction) {
  switch (action) {
    case "brain_dump":
      return "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
    case "outline":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100";
    case "publish":
      return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-100";
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
}

function Badge({ label, colorClasses }: { label: string; colorClasses: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}>
      {label}
    </span>
  );
}

export default function SavedIdeasPage() {
  const { savedIdeas, deleteIdea, clearIdeas } = useSavedIdeas();
  const sortedIdeas = useMemo(
    () =>
      [...savedIdeas].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [savedIdeas],
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 via-white to-sky-100/60 px-0 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-sky-900/40">
      <div className="pointer-events-none absolute left-8 top-10 h-48 w-48 -translate-x-1/2 rounded-full bg-sky-500/30 blur-3xl dark:bg-sky-500/40" />
      <div className="pointer-events-none absolute right-[-120px] top-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-600/20" />

      <main className="relative mx-auto max-w-6xl space-y-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-lg backdrop-blur-lg dark:border-slate-800/60 dark:bg-slate-900/70">
          <div className="flex items-center gap-4">
            <Logo size={48} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Saved Ideas</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your inspiration library.</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Browse everything you&apos;ve captured and keep the best ones handy.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
            >
              Back to Inbox
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Saved Ideas</h2>
            {sortedIdeas.length > 0 && (
              <button
                type="button"
                onClick={() => clearIdeas()}
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
              >
                Clear all
              </button>
            )}
          </div>

          {sortedIdeas.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">No saved ideas yet. Capture something on the inbox page to see it here.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedIdeas.map((idea) => (
                <TiltCard
                  key={idea.id}
                  className="bg-white/90 p-4 text-left shadow-xl dark:bg-slate-900/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-4">{idea.text}</p>
                    <button
                      type="button"
                      onClick={() => deleteIdea(idea.id)}
                      className="rounded-full border border-slate-200 bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    {idea.platforms.slice(0, 3).map((platform) => (
                      <Badge key={platform} label={platform} colorClasses="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                    ))}
                    <Badge
                      label={CONTENT_TYPE_LABELS[idea.contentType] ?? idea.contentType}
                      colorClasses="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100"
                    />
                    <Badge label={`⚡${idea.energy}`} colorClasses="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-100" />
                    <Badge label={NEXT_ACTION_LABELS[idea.nextAction]} colorClasses={getNextActionColor(idea.nextAction)} />
                    <Badge label={idea.status} colorClasses="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                  </div>
                  <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">Captured {formatDate(idea.createdAt)}</p>
                </TiltCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
