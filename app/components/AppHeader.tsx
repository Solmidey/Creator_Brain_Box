"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import Logo from "./Logo";

export function AppHeader() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? "light") === "dark";

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <header className="flex items-center justify-between gap-4 px-4 pt-4">
      <div className="flex items-center gap-3">
        <Logo
          mode={isDark ? "dark" : "light"}
          size={40}
          className="shadow-lg"
        />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-200">
          Creator Brain Inbox
        </span>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-700 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-xl active:translate-y-0 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-100"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="text-lg">{mounted ? (isDark ? "🌙" : "☀️") : ""}</span>
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/10 via-transparent to-amber-400/10 opacity-80" />
      </button>
    </header>
  );
}

export default AppHeader;
