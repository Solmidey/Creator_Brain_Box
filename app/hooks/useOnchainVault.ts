"use client";

import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

export interface OnchainSavePayload {
  id: string;
  content: string;
}

export interface UseOnchainVaultResult {
  isSaving: boolean;
  saveIdeasOnchain: (items: OnchainSavePayload[]) => Promise<void>;
}

const CONTRACT_ADDRESS = "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486";

// NOTE: Adjust the function name/signature here to match your deployed contract.
const CONTRACT_ABI = [
  "function saveIdea(string id, string content) external",
];

export function useOnchainVault(): UseOnchainVaultResult {
  const { signer } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (items: OnchainSavePayload[]) => {
      if (!signer) {
        throw new Error("Wallet not connected");
      }
      if (!items || items.length === 0) return;

      setIsSaving(true);

      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        for (const item of items) {
          const tx = await contract.saveIdea(item.id, item.content);
          await tx.wait();
        }
      } catch (err) {
        console.error("Failed to save ideas onchain", err);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [signer]
  );

  return { isSaving, saveIdeasOnchain };
}
