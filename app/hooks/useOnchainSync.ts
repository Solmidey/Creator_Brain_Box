"use client";

import { useOnchainVault, OnchainSavePayload } from "./useOnchainVault";
import { useEthersWallet } from "./useEthersWallet";

export interface UseOnchainSyncResult {
  isConnected: boolean;
  isSaving: boolean;
  saveIdeasOnchain: (payload: OnchainSavePayload) => Promise<void>;
}

export function useOnchainSync(): UseOnchainSyncResult {
  const { isConnected } = useEthersWallet();
  const { isSaving, saveIdeasOnchain } = useOnchainVault();

  return {
    isConnected,
    isSaving,
    saveIdeasOnchain,
  };
}
