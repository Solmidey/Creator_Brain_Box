"use client";

import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

const IDEA_VAULT_ADDRESS = "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486";

const IDEA_VAULT_ABI = [
  // This must match the Solidity contract you deployed
  "function saveIdeas(string[] ids, string[] contents) external",
];

export type OnchainSavePayload = {
  id: string;
  content: string;
};

export type UseOnchainVaultResult = {
  isSaving: boolean;
  saveIdeasOnchain: (items: OnchainSavePayload[]) => Promise<void>;
};

export function useOnchainVault(): UseOnchainVaultResult {
  const { signer, isConnected } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (items: OnchainSavePayload[]) => {
      if (!items || items.length === 0) return;

      if (!isConnected || !signer) {
        throw new Error("Wallet not connected. Connect your Base wallet first.");
      }

      const provider = signer.provider;
      if (!provider) {
        throw new Error("No provider found for connected wallet.");
      }

      const network = await provider.getNetwork();
      const chainId = network.chainId;

      // Base mainnet = 8453
      if (chainId !== 8453n) {
        throw new Error(
          "Please switch your wallet network to Base mainnet (chainId 8453) and try again."
        );
      }

      const ids = items.map((i) => i.id ?? "");
      const contents = items.map((i) => i.content ?? "");

      try {
        setIsSaving(true);

        const contract = new ethers.Contract(
          IDEA_VAULT_ADDRESS,
          IDEA_VAULT_ABI,
          signer
        );

        const tx = await contract.saveIdeas(ids, contents);
        await tx.wait();
      } catch (err: any) {
        console.error("[useOnchainVault] Failed to save ideas", err);

        // User rejected in wallet
        if (err?.code === 4001) {
          throw new Error("Transaction rejected in wallet.");
        }

        throw new Error(
          err?.reason ||
            err?.message ||
            "Failed to save ideas onchain. See console for details."
        );
      } finally {
        setIsSaving(false);
      }
    },
    [isConnected, signer]
  );

  return { isSaving, saveIdeasOnchain };
}
