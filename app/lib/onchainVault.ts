export const VAULT_ADDRESS =
  process.env.NEXT_PUBLIC_CREATOR_VAULT_ADDRESS ?? "";

export const VAULT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "kind", type: "string" },
      { internalType: "string", name: "content", type: "string" },
      { internalType: "string", name: "mediaUrl", type: "string" },
    ],
    name: "saveEntry",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
