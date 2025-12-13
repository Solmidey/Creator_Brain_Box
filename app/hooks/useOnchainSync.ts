"use client";

import { parseAbi } from "viem";
import { useAccount, useWriteContract } from "wagmi";

const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // TODO: replace with your deployed contract
const CONTRACT_ABI = parseAbi([
  // TODO: replace with your real ABI
  "function saveIdea(bytes32 ideaId, string contentHashOrCid) external",
]);

export function useOnchainSync() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  async function saveIdeaOnchain(params: {
    ideaId: string; // some UUID or local id
    hashOrCid: string; // hash of content or IPFS/Irys CID
  }) {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    // simple hash truncation; real code should hash to bytes32 off-chain
    const ideaBytes32 = `0x${params.ideaId
      .replace(/[^0-9a-fA-F]/g, "")
      .padEnd(64, "0")
      .slice(0, 64)}`;

    return await writeContractAsync({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: CONTRACT_ABI,
      functionName: "saveIdea",
      args: [ideaBytes32, params.hashOrCid],
    });
  }

  return {
    address,
    isConnected,
    isSaving: isPending,
    saveIdeaOnchain,
  };
}
