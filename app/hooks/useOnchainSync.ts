"use client";

import {
  OnchainSavePayload,
  UseOnchainVaultResult,
  useOnchainVault,
} from "./useOnchainVault";
import { useEthersWallet } from "./useEthersWallet";

export interface UseOnchainSyncResult {
  isConnected: boolean;
  isSaving: boolean;
  saveIdeasOnchain: UseOnchainVaultResult["saveIdeasOnchain"];
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
