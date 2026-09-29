"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Blocks, LayoutGrid, MessageSquare, Palette, Smartphone } from "lucide-react";
import { PageShell } from "@pallet/ui";
import { BrandSwitcher } from "./brand-switcher";

export function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <PageShell
      app="Pallet"
      appIcon={Palette}
      linkAs={Link}
      activePath={pathname}
      width="wide"
      nav={[
        {
          label: "设计系统",
          items: [
            { label: "组件总览", href: "/", icon: LayoutGrid },
            { label: "实战示例", href: "/demo", icon: Blocks },
            { label: "Chat", href: "/chat", icon: MessageSquare },
            { label: "Chat（手机整页）", href: "/chat-mobile", icon: Smartphone },
          ],
        },
      ]}
      actions={<BrandSwitcher />}
    >
      {children}
    </PageShell>
  );
}
