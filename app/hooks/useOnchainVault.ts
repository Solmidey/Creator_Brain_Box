"use client";

import { useCallback, useState } from "react";
import { getIdeaVaultContract } from "../lib/ideaVault";
import { useEthersWallet } from "./useEthersWallet";

export type OnchainSavePayload = {
  kind: "idea" | "media" | string;
  content: string;
  mediaUrl?: string;
};

export type UseOnchainVaultResult = {
  isSaving: boolean;
  saveIdeasOnchain: (items: OnchainSavePayload[]) => Promise<void>;
};

export function useOnchainVault(): UseOnchainVaultResult {
  const { provider, signer, isConnected, chainId } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (items: OnchainSavePayload[]) => {
      if (!provider || !signer || !isConnected) {
        throw new Error("Wallet not connected");
      }

      // enforce Base mainnet
      if (chainId !== 8453) {
        throw new Error("Please switch your wallet to Base mainnet.");
      }

      setIsSaving(true);
      try {
        const contract = getIdeaVaultContract(signer);

        for (const item of items) {
          const tx = await contract.saveEntry(
            item.kind,
            item.content,
            item.mediaUrl ?? ""
          );
          await tx.wait();
        }
      } finally {
        setIsSaving(false);
      }
    },
    [provider, signer, isConnected, chainId]
  );

  return { isSaving, saveIdeasOnchain };
}
