"use client";

import { useState } from "react";

import type { Idea } from "../types/ideas";

type EditableIdeaCardProps = {
  idea: Idea;
  onChange: (patch: Partial<Idea>) => void;
  onDelete: () => void;
};

const STATUS_OPTIONS: Idea["status"][] = ["Inbox", "Ready", "Drafting", "Posted"];
const NEXT_ACTION_OPTIONS: Idea["nextAction"][] = ["brain_dump", "outline", "publish"];

export function EditableIdeaCard({ idea, onChange, onDelete }: EditableIdeaCardProps) {
  const [localText, setLocalText] = useState(idea.text);
  const [localStatus, setLocalStatus] = useState(idea.status);
  const [localNextAction, setLocalNextAction] = useState(idea.nextAction);

  const commitText = () => {
    onChange({ text: localText.trim() });
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <textarea
        className="mb-3 h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={commitText}
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
                {action === "brain_dump"
                  ? "Brain dump"
                  : action === "outline"
                  ? "Outline"
                  : "Publish"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Updated {new Date(idea.updatedAt).toLocaleDateString()}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-full bg-rose-500/10 px-2 py-1 text-[11px] font-medium text-rose-500 hover:bg-rose-500/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
