"use client";

import React from "react";

import { useMediaLibrary } from "../hooks/useMediaLibrary";

/* eslint-disable @next/next/no-img-element */

export default function MediaLibraryPage() {
  const { items, removeItem, clearAll } = useMediaLibrary();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Media Library</h1>
            <p className="mt-1 text-xs text-slate-400">
              All images, videos, and files you&apos;ve uploaded in Brain Forge. Stored locally in your browser.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-red-500 hover:text-red-300"
            >
              Clear library
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <p className="text-sm text-slate-400">
            No media yet. Upload images or videos in Brain Forge and they will appear here automatically.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden bg-slate-800">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  ) : item.type === "video" ? (
                    <video src={item.url} controls className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-300">FILE</div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-3">
                  <div className="truncate text-[11px] font-medium text-slate-100">{item.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.type.toUpperCase()} · {new Date(item.createdAt).toLocaleString()}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <a
                      href={item.url}
                      download={item.name}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-sky-500 px-3 py-1 text-[10px] font-semibold text-white hover:bg-sky-400"
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[10px] text-slate-400 hover:text-red-400"
                    >
                      Remove
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
