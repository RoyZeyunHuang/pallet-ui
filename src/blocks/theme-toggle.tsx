"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../components/ui/button";

/** 亮/暗切换按钮。放 PageShell 的 actions 里即可，无需 props。 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      // 图标做了 mounted 门, aria-label 却没做 —— 系统偏暗色时 SSR(亮)/客户端(暗)
      // 必然不一致, 每页一条 hydration 报错(2026-08-13 chat demo 撞出的存量问题)
      aria-label={mounted ? (isDark ? "切换到亮色" : "切换到暗色") : "切换主题"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* 未挂载前不渲染图标，避免服务端/客户端主题不一致导致的闪烁 */}
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
