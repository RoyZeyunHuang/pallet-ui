import * as React from "react";
import { cn } from "../lib/utils";

/**
 * 语义状态徽章。不要自己写颜色——把状态归到这 6 类里，
 * 颜色由令牌统一决定，全站一致。
 */
export type StatusTone =
  | "neutral"  // 未开始、草稿
  | "info"     // 进行中、排队中
  | "success"  // 成功、已完成
  | "warning"  // 需注意、部分失败
  | "danger"   // 失败、错误
  | "brand";   // 主色强调

const TONES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-info/12 text-info ring-info/25",
  success: "bg-success/12 text-success ring-success/25",
  warning: "bg-warning/15 text-warning-foreground ring-warning/35 dark:text-warning",
  danger: "bg-destructive/12 text-destructive ring-destructive/25",
  brand: "bg-primary/12 text-primary ring-primary/25",
};

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  tone?: StatusTone;
  /** 显示一个小圆点。进行中的状态会自动加脉冲动画。 */
  dot?: boolean;
  /** 圆点持续脉冲，用于「正在跑」这类状态。 */
  pulse?: boolean;
}

export function StatusBadge({
  tone = "neutral",
  dot = false,
  pulse = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-xs font-medium whitespace-nowrap ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" />
          )}
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
