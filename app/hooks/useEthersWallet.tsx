"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserProvider } from "ethers";

type EthersWalletContextValue = {
  provider: BrowserProvider | null;
  signer: any | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<EthersWalletContextValue>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

const STORAGE_KEY = "creator-brain-wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 🔁 Silent reconnect on mount if we have a stored address
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const eth = (window as any).ethereum;
    if (!stored || !eth) return;

    (async () => {
      try {
        const browserProvider = new BrowserProvider(eth);
        const accounts = await browserProvider.send("eth_accounts", []);
        if (!accounts || accounts.length === 0) {
          window.localStorage.removeItem(STORAGE_KEY);
          return;
        }
        const nextSigner = await browserProvider.getSigner();
        const addr = await nextSigner.getAddress();
        const network = await browserProvider.getNetwork();

        setProvider(browserProvider);
        setSigner(nextSigner);
        setAddress(addr);
        setChainId(Number(network.chainId));
        setIsConnected(true);
      } catch (err) {
        console.error("[Wallet] Silent reconnect failed", err);
      }
    })();
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;

    const eth = (window as any).ethereum;
    if (!eth) {
      alert(
        "No wallet found. Install a Base-compatible wallet like Rainbow or MetaMask."
      );
      return;
    }

    try {
      const browserProvider = new BrowserProvider(eth);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts returned from wallet.");
      }

      const nextSigner = await browserProvider.getSigner();
      const addr = await nextSigner.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(nextSigner);
      setAddress(addr);
      setChainId(Number(network.chainId));
      setIsConnected(true);

      try {
        window.localStorage.setItem(STORAGE_KEY, addr);
      } catch {
        // ignore storage errors
      }
    } catch (err) {
      console.error("[Wallet] connect() failed", err);
      alert("Failed to connect wallet. Check console for details.");
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  // 🔔 React to account / chain changes from the wallet
  useEffect(() => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth || !eth.on) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) {
        disconnect();
        return;
      }
      setAddress(accounts[0]);
      setIsConnected(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, accounts[0]);
      } catch {
        // ignore
      }
    };

    const handleChainChanged = (hexId: string) => {
      try {
        const parsed = parseInt(hexId, 16);
        if (!Number.isNaN(parsed)) setChainId(parsed);
      } catch {
        // ignore
      }
    };

    eth.on("accountsChanged", handleAccountsChanged);
    eth.on("chainChanged", handleChainChanged);

    return () => {
      if (!eth.removeListener) return;
      eth.removeListener("accountsChanged", handleAccountsChanged);
      eth.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  const value = useMemo(
    () => ({
      provider,
      signer,
      address,
      chainId,
      isConnected,
      connect,
      disconnect,
    }),
    [provider, signer, address, chainId, isConnected, connect, disconnect]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useEthersWallet(): EthersWalletContextValue {
  return useContext(WalletContext);
}

export type { EthersWalletContextValue };
