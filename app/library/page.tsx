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

  const handleSaveLibrary = async () => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }
    if (list.length === 0) {
      alert("No media to save yet.");
      return;
    }

    try {
      const payload = JSON.stringify(list);
      await saveIdeasOnchain({
        kind: "media-bundle",
        content: payload,
      });
      alert("Library snapshot saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save library onchain.");
    }
  };

  const handleSaveSingle = async (item: any) => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }

    try {
      const payload = JSON.stringify(item);
      await saveIdeasOnchain({
        kind: "media",
        content: payload,
        mediaUrl: item.url || "",
      });
      alert("Media item saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save media onchain.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Library
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              All images, videos, and files you&apos;ve uploaded in Brain Forge. Stored locally in your browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSaveLibrary}
              disabled={!isConnected || isSaving || list.length === 0}
              className="rounded-full bg-sky-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving to Base..." : "Save library to Base"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="rounded-full border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-500 hover:text-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear library
            </button>
          </div>
        </header>

        {list.length === 0 ? (
          <p className="mt-10 text-sm text-slate-400">
            No media yet. Upload images or videos in Brain Forge and they&apos;ll show up here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {list.map((item: any) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60"
              >
                <div className="aspect-video w-full bg-slate-950/60">
                  {item.type === "image" && item.url && (
                    <img
                      src={item.url}
                      alt={item.name || "Uploaded image"}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.type === "video" && item.url && (
                    <video
                      src={item.url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  )}
                  {item.type === "file" && (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      File: {item.name || item.url}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2 p-3 text-xs">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {item.name || "Untitled media"}
                    </div>
                    {item.platform && (
                      <div className="inline-flex rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-300">
                        {item.platform}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-slate-400 hover:text-red-400"
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      disabled={!isConnected || isSaving}
                      onClick={() => handleSaveSingle(item)}
                      className="rounded-full bg-sky-600 px-3 py-1 font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save onchain
                    </button>
                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        download={item.name || undefined}
                        className="rounded-full border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:border-slate-500 hover:text-slate-50"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
