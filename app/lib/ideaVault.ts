import { Contract } from "ethers";

/**
 * TODO: Replace this with your real IdeaVault contract address on Base mainnet.
 * Example: 0x1234...abcd
 */
export const IDEA_VAULT_ADDRESS = "0xYourBaseMainnetIdeaVaultAddress";

export const IDEA_VAULT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "contentCid", type: "string" },
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "platform", type: "string" },
    ],
    name: "saveIdea",
    outputs: [{ internalType: "uint256", name: "id", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

/**
 * Make a typed IdeaVault contract instance from any ethers signer or provider.
 */
export function getIdeaVaultContract(signerOrProvider: any) {
  return new Contract(IDEA_VAULT_ADDRESS, IDEA_VAULT_ABI, signerOrProvider);
}
