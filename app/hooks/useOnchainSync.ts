"use client";

import { useMemo } from "react";

type OnchainSyncStatus = "disabled" | "idle" | "syncing" | "error" | "success";

export type UseOnchainSyncResult = {
  isEnabled: boolean;
  isSyncing: boolean;
  status: OnchainSyncStatus;
  lastSyncAt: string | null;
  syncToChain: () => Promise<void>;

  // Fields expected by SavedIdeasPage
  isConnected: boolean;
  isSaving: boolean;
  saveIdeaOnchain: (idea?: any) => Promise<void>;
};

/**
 * Stubbed on-chain sync hook.
 * For now it does nothing and just tells the UI that on-chain sync is disabled.
 */
export function useOnchainSync(_ideas?: any[]): UseOnchainSyncResult {
  async function noop(idea?: any) {
    console.warn(
      "[useOnchainSync] On-chain sync is disabled in this build; wagmi/viem are not loaded.",
      idea,
    );
  }

  return useMemo(
    () => ({
      isEnabled: false,
      isSyncing: false,
      status: "disabled" as OnchainSyncStatus,
      lastSyncAt: null,
      syncToChain: noop,
      isConnected: false,
      isSaving: false,
      saveIdeaOnchain: noop,
    }),
    [],
  );
}
