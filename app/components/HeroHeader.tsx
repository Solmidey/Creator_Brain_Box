"use client";

import Link from "next/link";
import { useEthersWallet } from "../hooks/useEthersWallet";

function formatAddress(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function HeroHeader() {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  } = useEthersWallet();

  return (
    <section className="relative mt-8 w-full rounded-3xl border border-slate-800/70 bg-slate-950/80 px-6 py-8 shadow-[0_0_80px_rgba(56,189,248,0.25)] backdrop-blur md:px-10 md:py-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
            Creator Brain Box
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Vault For Your Cracked Ideas
          </h1>
          <p className="mt-4 text-sm text-slate-300 sm:text-base">
            Capture, sort, and play with every idea you don&apos;t want to lose.
            Turn scattered thoughts into ready-to-post content.
          </p>
        </div>

        <div className="max-w-sm space-y-4 md:text-right">
          <div>
            <p className="text-sm font-medium text-slate-100">
              Capture, sort, and play with your ideas.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Keep your brain inbox organized, then crack ideas open when
              it&apos;s time to create.
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 md:justify-end">
            <button
              type="button"
              onClick={isConnected ? disconnectWallet : connectWallet}
              className="rounded-full bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isConnecting}
            >
              {isConnecting
                ? "Connecting..."
                : isConnected && account
                ? formatAddress(account)
                : "Connect wallet"}
            </button>

            <Link
              href="/saved-ideas"
              className="rounded-full bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
            >
              View saved ideas
            </Link>
            <Link
              href="/brain-forge"
              className="rounded-full border border-slate-700/80 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 hover:border-sky-500/70"
            >
              Brain Forge
            </Link>
            <Link
              href="/library"
              className="rounded-full border border-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:border-slate-600"
            >
              Library
            </Link>
          </div>

          {error && (
            <p className="mt-1 text-xs text-rose-400 md:text-right">{error}</p>
          )}

          {isConnected && chainId !== 8453 && (
            <p className="mt-1 text-xs text-amber-400 md:text-right">
              Connected to chain {chainId}. Base mainnet is 8453.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroHeader;
export { HeroHeader };
