"use client";

import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

export type OnchainSavePayload = {
  id: string;
  content: string;
};

export type UseOnchainVaultResult = {
  isSaving: boolean;
  saveIdeasOnchain: (items: OnchainSavePayload[]) => Promise<void>;
};

const VAULT_ADDRESS = "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486";

// ⚠️ Make sure this matches your deployed contract's ABI later.
// For now we assume a simple function:
//   function saveSnapshot(string id, string content) external;
const VAULT_ABI = [
  "function saveSnapshot(string id, string content) external",
] as const;

export function useOnchainVault(): UseOnchainVaultResult {
  const { signer, chainId, isConnected } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (items: OnchainSavePayload[]) => {
      if (!items.length) return;

      if (!signer || !isConnected) {
        throw new Error("Wallet not connected");
      }

      if (chainId !== 8453) {
        throw new Error(
          "Please switch your wallet to Base mainnet (chainId 8453)."
        );
      }

      const contract = new Contract(VAULT_ADDRESS, VAULT_ABI, signer);

      setIsSaving(true);
      try {
        // Batch into one JSON blob for now
        const json = JSON.stringify(items);
        const id = items[0]?.id ?? `batch-${Date.now()}`;

        const tx = await contract.saveSnapshot(id, json);
        await tx.wait();
      } finally {
        setIsSaving(false);
      }
    },
    [signer, chainId, isConnected]
  );

  return { isSaving, saveIdeasOnchain };
}
