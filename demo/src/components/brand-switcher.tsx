"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from "@pallet/ui";

/** 与 src/styles.css 里注释的色相角一一对应 */
export const BRANDS = [
  { name: "靛紫", hue: 265 },
  { name: "蓝", hue: 230 },
  { name: "青", hue: 195 },
  { name: "绿", hue: 145 },
  { name: "琥珀", hue: 60 },
  { name: "橙", hue: 25 },
  { name: "玫红", hue: 350 },
] as const;

/**
 * 演示用：实时切换 --brand-h 看效果。
 * 真实 app 里不需要这个组件——直接在 globals.css 里写死一个色相角即可。
 */
export function BrandSwitcher() {
  const [hue, setHue] = React.useState<number>(265);

  function apply(h: number) {
    setHue(h);
    document.documentElement.style.setProperty("--brand-h", String(h));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="切换主色">
          <Palette className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          --brand-h：一个变量换全套配色
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {BRANDS.map((b) => (
          <DropdownMenuItem
            key={b.hue}
            onClick={() => apply(b.hue)}
            className="gap-2"
          >
            <span
              className="size-3.5 shrink-0 rounded-full ring-1 ring-black/10"
              style={{ background: `oklch(0.53 0.17 ${b.hue})` }}
            />
            <span className="flex-1">{b.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {b.hue}
            </span>
            <Check
              className={cn("size-3.5", hue === b.hue ? "opacity-100" : "opacity-0")}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
