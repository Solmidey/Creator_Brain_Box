"use client";

import Link from "next/link";

import { EditableIdeaCard } from "../components/EditableIdeaCard";
import { useSavedIdeas } from "../hooks/useSavedIdeas";

export default function SavedIdeasPage() {
  const { savedIdeas, updateIdea, deleteIdea } = useSavedIdeas();
  const sortedIdeas = [...savedIdeas].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

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
              <EditableIdeaCard
                key={idea.id}
                idea={idea}
                onChange={(patch) => updateIdea(idea.id, patch)}
                onDelete={() => deleteIdea(idea.id)}
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
    </div>
  );
}
