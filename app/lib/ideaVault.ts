"use client";

import { Contract } from "ethers";

export const IDEA_VAULT_ADDRESS =
  "0x16ACCd3a0182fBA9B52C0298Fb7F0Bb3e34ce486" as const;

export const IDEA_VAULT_ABI = [
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
  {
    inputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "string", name: "content", type: "string" },
      { internalType: "string", name: "mediaUrl", type: "string" },
    ],
    name: "updateEntry",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    name: "getEntry",
    outputs: [
      {
        components: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "string", name: "kind", type: "string" },
          { internalType: "string", name: "content", type: "string" },
          { internalType: "string", name: "mediaUrl", type: "string" },
          { internalType: "uint64", name: "createdAt", type: "uint64" },
          { internalType: "uint64", name: "updatedAt", type: "uint64" },
        ],
        internalType: "struct CreatorBrainVault.Entry",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMyEntryIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function getIdeaVaultContract(signerOrProvider: any) {
  return new Contract(IDEA_VAULT_ADDRESS, IDEA_VAULT_ABI, signerOrProvider);
}
