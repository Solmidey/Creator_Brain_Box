"use client";

import React from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

type EthersWalletContextValue = {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = React.createContext<EthersWalletContextValue | null>(null);

const STORAGE_KEY = "creator-brain-box:walletConnected";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = React.useState<BrowserProvider | null>(null);
  const [signer, setSigner] = React.useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [chainId, setChainId] = React.useState<number | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const isConnected = !!provider && !!signer && !!address;

  const connect = React.useCallback(async () => {
    if (typeof window === "undefined") return;

    const anyWindow = window as any;

    if (!anyWindow.ethereum) {
      alert(
        "No wallet found. Install a Base-compatible wallet like Coinbase Wallet or MetaMask."
      );
      return;
    }

    try {
      setIsConnecting(true);

      const eth = anyWindow.ethereum;
      const browserProvider = new BrowserProvider(eth);
      const signer = await browserProvider.getSigner();
      const addr = await signer.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(addr);
      setChainId(Number(network.chainId));

      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch (err) {
      console.error("Wallet connect failed", err);
      // if it fails, don’t keep the “remember me” flag
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = React.useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnecting(false);

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  // Auto-reconnect if user had a wallet connected before
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldReconnect = window.localStorage.getItem(STORAGE_KEY) === "true";
    if (!shouldReconnect) return;

    // fire and forget – errors are handled inside connect()
    void connect();
  }, [connect]);

  const value = React.useMemo(
    () => ({
      provider,
      signer,
      address,
      chainId,
      isConnected,
      isConnecting,
      connect,
      disconnect,
    }),
    [
      provider,
      signer,
      address,
      chainId,
      isConnected,
      isConnecting,
      connect,
      disconnect,
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useEthersWallet(): EthersWalletContextValue {
  const ctx = React.useContext(WalletContext);
  if (!ctx) {
    throw new Error("useEthersWallet must be used inside WalletProvider");
  }
  return ctx;
}
