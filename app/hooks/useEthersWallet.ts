"use client";

import { useCallback, useState } from "react";
import { BrowserProvider } from "ethers";

const BASE_CHAIN_ID_HEX = "0x2105"; // 8453

export interface UseEthersWalletResult {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

export function useEthersWallet(): UseEthersWalletResult {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (typeof window === "undefined") {
        setError("Wallet can only be connected in the browser.");
        return;
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        setError("No wallet found. Install MetaMask or a Base-compatible wallet.");
        return;
      }

      // Make sure we are on Base mainnet
      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID_HEX }],
        });
      } catch (err: any) {
        if (err?.code === 4902) {
          // Chain not added yet – add Base
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_CHAIN_ID_HEX,
                chainName: "Base",
                rpcUrls: ["https://mainnet.base.org"],
                nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://basescan.org"],
              },
            ],
          });
        } else {
          throw err;
        }
      }

      const provider = new BrowserProvider(ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        setError("No account returned from wallet.");
        return;
      }

      const network = await provider.getNetwork();

      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
    } catch (err: any) {
      console.error("connectWallet error", err);
      setError(err?.message ?? "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    // We can't force-disconnect the wallet, but we can clear local state
    setAccount(null);
    setChainId(null);
    setError(null);
  }, []);

  return {
    account,
    chainId,
    isConnected: !!account,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
  };
}
