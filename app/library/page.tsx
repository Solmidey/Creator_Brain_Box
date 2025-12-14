"use client";

/* eslint-disable @next/next/no-img-element */

import React from "react";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useEthersWallet } from "../hooks/useEthersWallet";
import { useOnchainVault } from "../hooks/useOnchainVault";

export default function LibraryPage() {
  const { items, removeItem, clearAll } = useMediaLibrary();
  const { isConnected } = useEthersWallet();
  const { isSaving, saveIdeasOnchain } = useOnchainVault();

  const list = items ?? [];

  const handleSaveAllOnchain = async () => {
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
      const id = `library-${Date.now()}`;
      await saveIdeasOnchain([{ id, content: payload }]);
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
      const id = item.id || `media-${Date.now()}`;
      await saveIdeasOnchain([{ id, content: payload }]);
      alert("Media item saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save this media onchain.");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
            <p className="text-sm text-muted-foreground">
              All images, videos and files you&apos;ve uploaded inside Creator Brain Box.
              Stored locally first — optionally mirrored to <span className="font-medium">Base</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear local library
            </button>
            <button
              type="button"
              onClick={handleSaveAllOnchain}
              disabled={!isConnected || isSaving || list.length === 0}
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving library to Base..." : "Save all media to Base"}
            </button>
          </div>
        </header>

        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No media yet. Upload images or videos in Brain Forge and they will appear here automatically.
          </p>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {list.map((item: any) => {
              const thumbSrc = item.previewUrl || item.url || item.dataUrl || "";
              const isImage = item.type?.startsWith("image/");
              const isVideo = item.type?.startsWith("video/");

              return (
                <article
                  key={item.id || item.url || item.name || Math.random()}
                  className="flex flex-col justify-between rounded-xl border border-slate-800 bg-card/70 p-3 shadow-sm"
                >
                  <div className="mb-2 overflow-hidden rounded-lg border border-slate-800 bg-black/20">
                    {thumbSrc ? (
                      isVideo ? (
                        <video
                          src={thumbSrc}
                          controls
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <img
                          src={thumbSrc}
                          alt={item.name || "Uploaded media"}
                          className="h-40 w-full object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center text-xs text-muted-foreground">
                        No preview available
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="truncate font-medium">
                      {item.name || "Untitled file"}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {item.type && <span>{item.type}</span>}
                      {item.size && (
                        <span>
                          • {(item.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div className="flex gap-2">
                      <a
                        href={thumbSrc || "#"}
                        download={item.name || "media"}
                        className="rounded-full bg-slate-800 px-3 py-1 font-medium text-slate-50 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Download
                      </a>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-full border border-slate-700 px-3 py-1 font-medium text-slate-200 hover:border-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={!isConnected || isSaving}
                      onClick={() => handleSaveSingle(item)}
                      className="rounded-full bg-sky-600 px-3 py-1 font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save onchain
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
