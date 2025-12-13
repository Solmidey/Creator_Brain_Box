"use client";

import React from "react";
import { http, createConfig } from "wagmi";
import { base, mainnet, sepolia } from "wagmi/chains";
import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
  lightTheme,
} from "@rainbow-me/rainbowkit";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Creator Brain Box",
    projectId: "WALLETCONNECT_PROJECT_ID_TODO", // TODO: replace with your real project id
    chains: [base, mainnet, sepolia],
    transports: {
      [base.id]: http(),
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  }),
);

// Wrapper component for App Router
export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <RainbowKitProvider
      theme={{
        lightMode: lightTheme({
          accentColor: "#38bdf8",
        }),
        darkMode: darkTheme({
          accentColor: "#38bdf8",
        }),
      }}
    >
      {children}
    </RainbowKitProvider>
  );
}
