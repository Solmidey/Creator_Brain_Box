"use client";

import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

const VAULT_ADDRESS = "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486" as const;

const VAULT_ABI = [
  "function saveEntry(string kind,string content,string mediaUrl) external returns (uint256)",
] as const;

export type OnchainSaveKind =
  | "idea"
  | "idea-bundle"
  | "media"
  | "media-bundle";

export interface OnchainSavePayload {
  kind: OnchainSaveKind;
  content: string;       // JSON payload
  mediaUrl?: string;     // optional media URL
}

export interface UseOnchainVaultResult {
  isSaving: boolean;
  saveIdeasOnchain: (payload: OnchainSavePayload) => Promise<void>;
}

export function useOnchainVault(): UseOnchainVaultResult {
  const { provider, signer, address, isConnected } = useEthersWallet();
  const [isSaving, setIsSaving] = useState(false);

  const saveIdeasOnchain = useCallback(
    async (payload: OnchainSavePayload) => {
      if (!provider || !signer || !address || !isConnected) {
        throw new Error("Wallet not connected");
      }

      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      if (chainId !== 8453) {
        throw new Error("Wrong network. Please switch to Base mainnet.");
      }

      setIsSaving(true);
      try {
        const contract = new Contract(VAULT_ADDRESS, VAULT_ABI, signer);
        const tx = await contract.saveEntry(
          payload.kind,
          payload.content,
          payload.mediaUrl ?? ""
        );
        await tx.wait();
      } finally {
        setIsSaving(false);
      }
    },
    [provider, signer, address, isConnected]
  );

  return { isSaving, saveIdeasOnchain };
}
