"use client";

import * as React from "react";
import { ThemeProvider as NextThemes } from "next-themes";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/sonner";

/**
 * 每个 app 的 layout.tsx 里包一层这个就够了：
 * 主题（亮/暗/跟随系统）、Tooltip、Toast 全部接好，不需要再配任何东西。
 */
export function PalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delayDuration={200}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </NextThemes>
  );
}
