"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useOnchainVault } from "../hooks/useOnchainVault";
import { useEthersWallet } from "../hooks/useEthersWallet";

export default function LibraryPage() {
  const { items, removeItem, clearAll } = useMediaLibrary();
  const { saveIdeasOnchain, isSaving } = useOnchainVault();
  const { isConnected } = useEthersWallet();

  const list = items ?? [];

  const handleSaveAllOnchain = async () => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }
    if (!list.length) {
      alert("No media to save yet.");
      return;
    }

    try {
      const payload = JSON.stringify(list);
      await saveIdeasOnchain([
        {
          kind: "media",
          content: payload,
        },
      ]);
      alert("Library snapshot saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save library onchain. Check console for details.");
    }
  };

  const handleSaveSingle = async (item: any) => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }

    try {
      const payload = JSON.stringify(item);
      await saveIdeasOnchain([
        {
          kind: "media",
          content: payload,
        },
      ]);
      alert("Media item saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save media onchain.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
            <p className="mt-1 text-sm text-slate-400">
              All images, videos and files you&apos;ve uploaded inside Creator
              Brain Box. Stored locally first — when it matters, you can send a
              snapshot to <span className="font-medium">Base</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAllOnchain}
              disabled={!isConnected || isSaving || !list.length}
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving to Base..." : "Save library to Base"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={!list.length}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear all
            </button>
          </div>
        </header>

        {list.length === 0 ? (
          <p className="text-sm text-slate-400">
            No media yet. Upload images or videos in Brain Forge and they&apos;ll
            show up here.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item: any) => (
              <article
                key={item.id ?? item.url ?? item.src ?? Math.random()}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40"
              >
                <div className="relative aspect-video w-full bg-slate-900">
                  {item.type === "video" ? (
                    <video
                      src={item.url ?? item.src}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url ?? item.src}
                      alt={item.alt || "Media item"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2 p-3 text-xs">
                  <div className="space-y-1">
                    <div className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                      {item.type || "media"}
                    </div>
                    {item.note && (
                      <p className="text-slate-300 line-clamp-2">
                        {item.note}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      disabled={!isConnected || isSaving}
                      onClick={() => handleSaveSingle(item)}
                      className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save onchain
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
