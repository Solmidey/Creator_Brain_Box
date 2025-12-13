"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

type EthersWalletContextValue = {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
};

const WalletContext = createContext<EthersWalletContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "cbx:walletAddress";
const BASE_CHAIN_ID_HEX = "0x2105"; // Base mainnet (8453)

export function EthersWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Helper: clear all wallet state
  const clearState = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Auto-reconnect on load if we have a stored address
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedAddress = window.localStorage.getItem(STORAGE_KEY);
    if (!storedAddress) return;

    const eth = (window as any).ethereum;
    if (!eth) return;

    const browserProvider = new BrowserProvider(eth);
    setProvider(browserProvider);

    (async () => {
      try {
        // Make sure we're on Base
        try {
          await eth.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: BASE_CHAIN_ID_HEX }],
          });
        } catch {
          // If it fails, we still keep them "connected" to whatever chain they're on,
          // but onchain writes may fail. No hard crash here.
        }

        const signer = await browserProvider.getSigner();
        const addr = await signer.getAddress();

        setSigner(signer);
        setAddress(addr);
        window.localStorage.setItem(STORAGE_KEY, addr);
      } catch (err) {
        console.error("Auto-reconnect failed:", err);
        clearState();
      }
    })();

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        clearState();
        return;
      }
      setAddress(accounts[0]);
      window.localStorage.setItem(STORAGE_KEY, accounts[0]);
    };

    const handleDisconnect = () => {
      clearState();
    };

    eth.on?.("accountsChanged", handleAccountsChanged);
    eth.on?.("disconnect", handleDisconnect);

    return () => {
      eth.removeListener?.("accountsChanged", handleAccountsChanged);
      eth.removeListener?.("disconnect", handleDisconnect);
    };
  }, []);

  const connect = async () => {
    if (typeof window === "undefined") return;

    const eth = (window as any).ethereum;
    if (!eth) {
      alert("No wallet found. Install MetaMask or any Base-compatible wallet.");
      return;
    }

    setIsConnecting(true);
    try {
      // Force/suggest Base mainnet
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: BASE_CHAIN_ID_HEX }],
        });
      } catch (switchError: any) {
        console.warn("Could not switch to Base:", switchError);
      }

      const accounts: string[] = await eth.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        clearState();
        return;
      }

      const browserProvider = new BrowserProvider(eth);
      const signer = await browserProvider.getSigner();
      const addr = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(addr);
      window.localStorage.setItem(STORAGE_KEY, addr);
    } catch (err) {
      console.error("Wallet connect failed:", err);
      clearState();
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    clearState();
  };

  const value: EthersWalletContextValue = useMemo(
    () => ({
      address,
      isConnecting,
      isConnected: !!address,
      connect,
      disconnect,
      provider,
      signer,
    }),
    [address, isConnecting, provider, signer],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useEthersWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error(
      "useEthersWallet must be used inside an <EthersWalletProvider>",
    );
  }
  return ctx;
}
