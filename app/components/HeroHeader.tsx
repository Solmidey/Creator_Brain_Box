import Link from "next/link";

import Logo from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export default function HeroHeader({ onOpenHelper }: { onOpenHelper: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900/80 px-6 py-5 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.7)] backdrop-blur sm:px-8 sm:py-6 dark:bg-slate-900/90">
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rotate-[-18deg] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(148,163,184,0.12)_0,transparent_18%,rgba(148,163,184,0.18)_20%,transparent_22%,rgba(148,163,184,0.12)_24%,transparent_40%,transparent_100%)] opacity-50" />
      <div className="pointer-events-none absolute right-6 top-6 h-28 w-28 rotate-12 bg-[radial-gradient(circle_at_30%_0%,rgba(94,234,212,0.16),transparent_55%),conic-gradient(from_120deg_at_50%_50%,rgba(94,234,212,0.18),rgba(14,165,233,0)_22%,rgba(94,234,212,0.18)_24%,rgba(56,189,248,0)_42%,rgba(94,234,212,0.2)_44%,rgba(14,165,233,0)_100%)] opacity-60" />
      <div className="pointer-events-none absolute -bottom-8 left-12 h-28 w-48 rotate-[14deg] bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_32%),conic-gradient(from_210deg_at_50%_50%,rgba(226,232,240,0.12)_0,rgba(226,232,240,0)_26%,rgba(226,232,240,0.16)_28%,rgba(226,232,240,0)_48%,rgba(226,232,240,0.12)_50%,rgba(226,232,240,0)_100%)] opacity-60" />

      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_0%,#38bdf8_0,#0f172a_55%,#020617_100%)] shadow-[0_0_40px_rgba(56,189,248,0.35)] sm:h-14 sm:w-14">
            <div className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle_at_20%_20%,rgba(248,250,252,0.3),transparent_55%),conic-gradient(from_210deg_at_50%_50%,rgba(15,23,42,0)_0,rgba(15,23,42,0)_30%,rgba(248,250,252,0.4)_32%,rgba(15,23,42,0)_34%,rgba(248,250,252,0.4)_36%,rgba(15,23,42,0)_38%,rgba(248,250,252,0.4)_40%,rgba(15,23,42,0)_100%)]" />
            <Logo mode="dark" size={40} className="absolute inset-0 m-auto" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Creator Brain</span>
            <span className="text-sm font-medium text-slate-100">Inbox for cracked ideas</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:items-end sm:gap-3">
          <div className="space-y-1 sm:text-right">
            <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">Capture, sort, and play with your ideas.</h1>
            <p className="text-sm text-slate-400">Keep your brain inbox organized, then crack ideas open when it’s time to create.</p>
          </div>

          <div className="mt-1 flex flex-wrap gap-3 sm:mt-0 sm:justify-end">
            <Link
              href="/saved-ideas"
              className="inline-flex items-center justify-center rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(139,92,246,0.6)] transition-transform hover:-translate-y-[1px] hover:bg-violet-600 active:translate-y-0"
            >
              View saved ideas
            </Link>
            <button
              type="button"
              onClick={onOpenHelper}
              className="inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-100 transition-transform hover:-translate-y-[1px] hover:border-slate-400 hover:bg-slate-800/80 active:translate-y-0"
            >
              New idea
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
