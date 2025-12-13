"use client";

import React from "react";
import { http } from "wagmi";
import { mainnet, base, sepolia } from "wagmi/chains";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";

// wagmi + RainbowKit config (NO createConfig wrapper)
export const wagmiConfig = getDefaultConfig({
  appName: "Creator Brain Box",
  // You can replace this with a real WalletConnect project id + env var
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
    "WALLETCONNECT_PROJECT_ID_TODO",
  chains: [base, mainnet, sepolia],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

// Wrap children with RainbowKit styling
export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKitProvider theme={darkTheme({ accentColor: "#38bdf8" })}>
      {children}
    </RainbowKitProvider>
  );
}
