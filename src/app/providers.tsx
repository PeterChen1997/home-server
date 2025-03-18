"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { NetworkProvider } from "@/contexts/NetworkContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <NetworkProvider>{children}</NetworkProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
