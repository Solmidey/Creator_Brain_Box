"use client";

import { useCallback, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import { useWallet } from "./useWallet";
import { IDEA_VAULT_ADDRESS, IDEA_VAULT_ABI } from "../lib/ideaVault";

type OnchainSyncStatus = "disabled" | "idle" | "syncing" | "error" | "success";

export type UseOnchainSyncResult = {
  isEnabled: boolean;
  isSyncing: boolean;
  status: OnchainSyncStatus;
  lastSyncAt: string | null;
  syncToChain: (idea?: any) => Promise<void>;
  isConnected: boolean;
  isSaving: boolean;
  saveIdeaOnchain: (idea?: any) => Promise<void>;
};

/**
 * On-chain sync hook for Creator Brain Box.
 * - Connects to any Base-compatible wallet via window.ethereum
 * - Saves idea metadata to an IdeaVault contract on Base mainnet
 */
export function useOnchainSync(): UseOnchainSyncResult {
  const { isConnected, isOnBaseMainnet } = useWallet();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<OnchainSyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const saveIdeaOnchain = useCallback(
    async (idea?: any) => {
      const eth = (window as any).ethereum;

      if (!eth) {
        console.warn("[useOnchainSync] No injected wallet found");
        setStatus("error");
        return;
      }

      if (!isConnected || !isOnBaseMainnet) {
        console.warn(
          "[useOnchainSync] Wallet not connected or not on Base mainnet"
        );
        setStatus("error");
        return;
      }

      if (
        !IDEA_VAULT_ADDRESS ||
        IDEA_VAULT_ADDRESS === "0xYourBaseMainnetIdeaVaultAddress"
      ) {
        console.warn(
          "[useOnchainSync] IDEA_VAULT_ADDRESS is not configured. Deploy your contract on Base mainnet and update app/lib/ideaVault.ts."
        );
        setStatus("error");
        return;
      }

      try {
        setIsSaving(true);
        setStatus("syncing");

        const provider = new BrowserProvider(eth);
        const signer = await provider.getSigner();
        const contract = new Contract(
          IDEA_VAULT_ADDRESS,
          IDEA_VAULT_ABI,
          signer
        );

        const rawText: string =
          idea?.text ??
          idea?.title ??
          idea?.ideaText ??
          "Untitled idea from Creator Brain Box";

        const title =
          idea?.title ??
          rawText.slice(0, 80);

        const platform =
          idea?.platform ??
          idea?.metadata?.platform ??
          "unknown";

        // Offchain pointer or empty string if not available yet
        const contentCid =
          idea?.contentCid ??
          idea?.ipfsCid ??
          idea?.irysId ??
          "";

        const tx = await contract.saveIdea(contentCid, title, platform);
        await tx.wait();

        const now = new Date().toISOString();
        setLastSyncAt(now);
        setStatus("success");
      } catch (err) {
        console.error("[useOnchainSync] Failed to save idea onchain", err);
        setStatus("error");
      } finally {
        setIsSaving(false);
      }
    },
    [isConnected, isOnBaseMainnet]
  );

  const syncToChain = saveIdeaOnchain;

  const isEnabled = useMemo(
    () => isConnected && isOnBaseMainnet,
    [isConnected, isOnBaseMainnet]
  );

  return {
    isEnabled,
    isSyncing: isSaving && status === "syncing",
    status,
    lastSyncAt,
    syncToChain,
    isConnected,
    isSaving,
    saveIdeaOnchain,
  };
}
