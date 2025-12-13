"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserProvider } from "ethers";

const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_MAINNET_HEX = "0x2105";

type WalletState = {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setState((s) => ({
        ...s,
        error: "No wallet found. Install a Base-compatible wallet like MetaMask or Coinbase Wallet.",
      }));
      return;
    }

    try {
      setState((s) => ({ ...s, isConnecting: true, error: null }));

      const provider = new BrowserProvider(window.ethereum);
      const accounts: string[] = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId.toString());

      // Ensure we are on Base mainnet
      if (chainId !== BASE_MAINNET_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_MAINNET_HEX }],
          });
        } catch (switchErr: any) {
          // If Base is not added, add it
          if (switchErr?.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: BASE_MAINNET_HEX,
                  chainName: "Base",
                  nativeCurrency: {
                    name: "Ethereum",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }
      }

      const finalProvider = new BrowserProvider(window.ethereum);
      const finalNetwork = await finalProvider.getNetwork();
      const finalChainId = Number(finalNetwork.chainId.toString());

      setState((s) => ({
        ...s,
        address: accounts[0] ?? null,
        chainId: finalChainId,
        isConnecting: false,
        error: null,
      }));
    } catch (err: any) {
      console.error("[useWallet] connect error", err);
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err?.message ?? "Failed to connect wallet",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setState((s) => ({ ...s, address: accounts[0] ?? null }));
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainIdNum = parseInt(chainIdHex, 16);
      setState((s) => ({ ...s, chainId: chainIdNum }));
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    ...state,
    isConnected: !!state.address,
    isOnBaseMainnet: state.chainId === BASE_MAINNET_CHAIN_ID,
    connect,
    disconnect,
  };
}
