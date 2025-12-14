"use client";

import React from "react";
import Link from "next/link";
import { useEthersWallet } from "../hooks/useEthersWallet";

export default function HeroHeader() {
  const { address, isConnected, connect, disconnect } =
    useEthersWallet();

  const shortAddress = React.useMemo(
    () =>
      address ? `${address.slice(0, 6)}…${address.slice(address.length - 4)}` : "",
    [address],
  );

  return (
    <section className="flex flex-col gap-6 rounded-3xl border bg-gradient-to-b from-slate-900 via-slate-950 to-black px-6 py-8 text-slate-50 md:flex-row md:items-center md:justify-between">
      <div className="space-y-4 md:max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-sky-300">
          Creator Brain Box
        </p>
        <h1 className="text-balance text-3xl font-semibold leading-tight md:text-4xl">
          Turn scattered ideas into an organised library you can even back up on{" "}
          <span className="text-sky-300">Base</span>.
        </h1>
        <p className="text-sm text-slate-300">
          Capture ideas, tag them, and build your personal knowledge library.
          Everything lives in your browser first. When it really matters, you
          can push a snapshot onchain.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isConnected ? disconnect : connect}
            disabled={false}
            className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-md shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {false
              ? "Connecting..."
              : isConnected
              ? `Disconnect ${shortAddress}`
              : "Connect wallet (Base)"}
          </button>

          <Link
            href="/saved-ideas"
            className="text-sm font-medium text-sky-300 underline-offset-4 hover:underline"
          >
            Save ideas onchain →
          </Link>
        </div>

        {isConnected ? (
          <p className="text-xs text-sky-200/80">
            Connected as <span className="font-mono">{shortAddress}</span>. Your
            ideas are always local-first — you choose what to back up onchain.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            No wallet needed for local saving. Connect when you&apos;re ready to
            sync to Base.
          </p>
        )}
      </div>

      <div className="mt-4 w-full max-w-sm md:mt-0">
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/40 bg-slate-900/60 p-4 shadow-lg shadow-sky-500/20">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-300">
                Library preview
              </p>
              <p className="text-xs text-slate-300">
                One place for your saved ideas and references.
              </p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-lg">
              📚
            </span>
          </div>

          <div className="space-y-2 rounded-xl bg-gradient-to-r from-sky-500/25 via-cyan-400/15 to-indigo-500/25 p-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-lg bg-sky-500/40" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-50">
                  Clip: &ldquo;Build once, reuse often&rdquo;
                </p>
                <p className="text-[11px] text-slate-200/80">
                  Turn your best ideas into reusable building blocks for
                  threads, videos, newsletters, and client work.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-300/90">
              <span>3 tags • 5 linked posts</span>
              <span className="rounded-full bg-slate-950/40 px-2 py-0.5 font-medium text-sky-200">
                Local + Base ready
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>Local-first. Onchain when you choose.</span>
            <Link
              href="/saved-ideas"
              className="font-medium text-sky-300 hover:text-sky-200"
            >
              Open ideas →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
