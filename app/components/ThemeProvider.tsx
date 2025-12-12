"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

type ProviderProps = {
  children: ReactNode;
  attribute?: "class";
  defaultTheme?: "light" | "dark" | "system";
  enableSystem?: boolean;
};

export function ThemeProvider({ children, ...props }: ProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
