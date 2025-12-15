"use client";

import React from "react";
import { useMediaLibrary } from "../hooks/useMediaLibrary";
import { useOnchainVault } from "../hooks/useOnchainVault";
import { useEthersWallet } from "../hooks/useEthersWallet";

export default function LibraryPage() {
  const { items, removeItem, clearAll } = useMediaLibrary();
  const { isSaving, saveIdeasOnchain } = useOnchainVault();
  const { isConnected } = useEthersWallet();

  const list = items ?? [];

  const handleSaveLibraryOnchain = async () => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }
    if (!list.length) {
      alert("No media to save yet.");
      return;
    }

    try {
      const payload = JSON.stringify(list as any);
      const id = "library-" + Date.now().toString();
      await saveIdeasOnchain([
        { id, kind: "media", content: payload }
      ]);
      alert("Library snapshot saved to Base.");
    } catch (err: any) {
      console.error("Failed to save library onchain:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : String(err);
      alert("Failed to save library onchain: " + message);
    }
  };

  const handleSaveItemOnchain = async (item: any) => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }

    try {
      const payload = JSON.stringify(item);
      const id = (item.id as string) || "media-" + Date.now().toString();
      await saveIdeasOnchain([
        { id, kind: "media", content: payload, mediaUrl: item.url }
      ]);
      alert("Media item saved to Base.");
    } catch (err: any) {
      console.error("Failed to save media onchain:", err);
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : String(err);
      alert("Failed to save media onchain: " + message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Library
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              All images, videos and files you&apos;ve uploaded inside Creator Brain Box.
              Stored locally first, with optional backups on Base.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveLibraryOnchain}
              disabled={!isConnected || isSaving || list.length === 0}
              className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving to Base..." : "Save library to Base"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              disabled={list.length === 0}
              className="rounded-full border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Clear local library
            </button>
          </div>
        </header>

        {list.length === 0 ? (
          <p className="text-sm text-slate-400">
            No media yet. Upload images or videos in Brain Forge and they&apos;ll show up here.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {list.map((item: any) => (
              <article
                key={item.id ?? item.url}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3"
              >
                <div className="h-32 w-full overflow-hidden rounded-lg bg-slate-900">
                  {item.type && String(item.type).startsWith("image/") ? (
                    <img
                      src={item.url}
                      alt={item.name || "Media"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      {item.type || "file"}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between gap-2 text-xs">
                  <div>
                    <div className="font-medium text-slate-100">
                      {item.name || "Untitled media"}
                    </div>
                    {item.type && (
                      <div className="text-slate-400">
                        {item.type}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={item.url}
                      download={item.name || "media"}
                      className="rounded-full bg-slate-800 px-3 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-700"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => handleSaveItemOnchain(item)}
                      disabled={!isConnected || isSaving}
                      className="rounded-full bg-sky-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save onchain
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-[11px] text-slate-400 hover:text-red-400"
                    >
                      Delete
                    </button>
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
