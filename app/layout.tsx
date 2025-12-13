import type { Metadata } from "next";
import type React from "react";

import "./globals.css";
import { Providers } from "./providers";
import { EthersWalletProvider } from "./hooks/useEthersWallet";

export const metadata: Metadata = {
  title: "Creator Brain Box",
  description: "Capture ideas once, reuse them everywhere. Local-first with optional Base onchain backup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <EthersWalletProvider>{children}</EthersWalletProvider>
        </Providers>
      </body>
    </html>
  );
}
