"use client";

import React from "react";
import { ThemeProvider } from "next-themes";

type ProvidersProps = { children: React.ReactNode };

/**
 * Global app providers for Creator Brain Box.
 * Currently handles dark/light theme via next-themes.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}

// Alias so existing imports `AppProviders` keep working
export const AppProviders = Providers;

export default Providers;
