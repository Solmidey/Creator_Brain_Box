"use client";

import { useMemo, useState } from "react";
import { Contract } from "ethers";
import { useEthersWallet } from "./useEthersWallet";

const VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_CB_VAULT_ADDRESS ??
  "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486";

// Minimal ABI for the functions we actually use
const CREATOR_BRAIN_VAULT_ABI = [
  "function saveIdea(string id, string content) public",
  "function saveLibraryItem(string id, string url, string mediaType) public",
];

export function useOnchainVault() {
  const { signer, isConnected, address } = useEthersWallet();
  const [isSavingIdea, setIsSavingIdea] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);

  const contract = useMemo(() => {
    if (!signer) return null;
    return new Contract(VAULT_ADDRESS, CREATOR_BRAIN_VAULT_ABI, signer);
  }, [signer]);

  const saveIdeaOnchain = async (id: string, content: string) => {
    if (!contract) throw new Error("Wallet not connected");
    setIsSavingIdea(true);
    try {
      const tx = await contract.saveIdea(id, content);
      await tx.wait();
    } finally {
      setIsSavingIdea(false);
    }
  };

  const saveMediaOnchain = async (
    id: string,
    url: string,
    mediaType: string,
  ) => {
    if (!contract) throw new Error("Wallet not connected");
    setIsSavingMedia(true);
    try {
      const tx = await contract.saveLibraryItem(id, url, mediaType);
      await tx.wait();
    } finally {
      setIsSavingMedia(false);
    }
  };

  return {
    isConnected,
    address,
    saveIdeaOnchain,
    saveMediaOnchain,
    isSavingIdea,
    isSavingMedia,
  };
}
