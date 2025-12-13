"use client";

import React from "react";
import { ThemeProvider } from "next-themes";

type ProvidersProps = { children: React.ReactNode };

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

// Keep existing imports working: `import { AppProviders } from "./providers"`
export const AppProviders = Providers;

export default Providers;
