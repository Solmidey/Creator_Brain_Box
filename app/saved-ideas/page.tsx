"use client";

import React from "react";
import { useSavedIdeas } from "../hooks/useSavedIdeas";
import { useOnchainVault } from "../hooks/useOnchainVault";
import { useEthersWallet } from "../hooks/useEthersWallet";

export default function SavedIdeasPage() {
  const { savedIdeas, deleteIdea } = useSavedIdeas();
  const { saveIdeasOnchain, isSaving } = useOnchainVault();
  const { isConnected } = useEthersWallet();

  const list = savedIdeas ?? [];

  const handleSaveAllOnchain = async () => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }
    if (!list.length) {
      alert("No ideas to save yet.");
      return;
    }

    try {
      const payload = JSON.stringify(list as any);
      await saveIdeasOnchain([
        {
          kind: "idea",
          content: payload,
        },
      ]);
      alert("All ideas saved to Base as a snapshot.");
    } catch (err) {
      console.error(err);
      alert("Failed to save ideas onchain. Check console for details.");
    }
  };

  const handleSaveSingle = async (idea: any) => {
    if (!isConnected) {
      alert("Connect your wallet (Base) first.");
      return;
    }

    try {
      const payload = JSON.stringify(idea);
      await saveIdeasOnchain([
        {
          kind: "idea",
          content: payload,
        },
      ]);
      alert("Idea saved to Base.");
    } catch (err) {
      console.error(err);
      alert("Failed to save this idea onchain.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Saved ideas
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything is stored locally first. When it matters, you can back it
            up on <span className="font-medium">Base</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAllOnchain}
          disabled={!isConnected || isSaving || list.length === 0}
          className="inline-flex items-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving to Base..." : "Save all ideas to Base"}
        </button>
      </div>

      <div className="grid gap-3">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t saved any ideas yet.
          </p>
        ) : (
          list.map((idea: any) => (
            <article
              key={idea.id ?? Math.random()}
              className="rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-medium">
                    {idea.title || idea.heading || "Untitled idea"}
                  </h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {idea.text ||
                      idea.content ||
                      idea.body ||
                      "(No preview text)"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => deleteIdea(idea.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    disabled={!isConnected || isSaving}
                    onClick={() => handleSaveSingle(idea)}
                    className="rounded-full bg-sky-600 px-3 py-1 font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save onchain
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
