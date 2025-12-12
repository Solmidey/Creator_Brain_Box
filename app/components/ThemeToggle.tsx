"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? "light") === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white/70 text-slate-800 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="text-lg">{mounted ? (isDark ? "🌙" : "☀️") : ""}</span>
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/10 via-transparent to-amber-400/10 opacity-80" />
    </button>
  );
}
