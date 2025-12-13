"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";

import { ThemeProvider } from "./components/ThemeProvider";
import { WalletProviders, wagmiConfig } from "./lib/walletConfig";

const queryClient = new QueryClient();

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WalletProviders>{children}</WalletProviders>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
