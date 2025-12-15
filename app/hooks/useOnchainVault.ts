"use client";

import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

const CREATOR_BRAIN_VAULT_ADDRESS = "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486" as const;

const CREATOR_BRAIN_VAULT_ABI = [
  "function saveEntry(string kind, string content, string mediaUrl) external returns (uint256 id)"
] as const;

export type OnchainSavePayload = {
  id: string;
  kind: "idea" | "media" | string;
  content: string;
  mediaUrl?: string;
};

export type UseOnchainVaultResult = {
  isSaving: boolean;
  saveIdeasOnchain: (items: OnchainSavePayload[]) => Promise<void>;
};

export function useOnchainVault(): UseOnchainVaultResult {
  const { signer, address, chainId, isConnected } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (items: OnchainSavePayload[]) => {
      if (!signer || !address || !isConnected) {
        throw new Error("Wallet not connected to Base.");
      }
      if (chainId !== 8453) {
        throw new Error("Please switch your wallet to Base mainnet.");
      }
      if (!items.length) return;

      const contract = new Contract(
        CREATOR_BRAIN_VAULT_ADDRESS,
        CREATOR_BRAIN_VAULT_ABI,
        signer
      );

      setIsSaving(true);
      try {
        for (const item of items) {
          const tx = await contract.saveEntry(
            item.kind || "idea",
            item.content,
            item.mediaUrl ?? ""
          );
          await tx.wait();
        }
      } catch (err) {
        console.error("Onchain save failed", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [signer, address, chainId, isConnected]
  );

  return { isSaving, saveIdeasOnchain };
}
