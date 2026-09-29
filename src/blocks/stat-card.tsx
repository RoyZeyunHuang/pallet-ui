import * as React from "react";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";

export interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** 副标题/说明，例如「较上周」。 */
  hint?: React.ReactNode;
  icon?: LucideIcon;
  /** 变化百分比。正数绿、负数红；配 invertDelta 可反转语义。 */
  delta?: number;
  /** 下降是好事时设 true（例如「失败率」）。 */
  invertDelta?: boolean;
  loading?: boolean;
}

/** KPI 数字卡。看板顶部用 grid 排 2–4 个。 */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  invertDelta = false,
  loading = false,
  className,
  ...props
}: StatCardProps) {
  const positive = delta !== undefined && delta >= 0;
  const good = invertDelta ? !positive : positive;

  return (
    <Card className={cn("gap-0 p-5", className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted-foreground">
          {label}
        </span>
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
      </div>

      {loading ? (
        <Skeleton className="mt-2 h-8 w-24" />
      ) : (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          {delta !== undefined && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium tabular-nums",
                good ? "text-success" : "text-destructive",
              )}
            >
              {positive ? (
                <ArrowUp className="size-3" />
              ) : (
                <ArrowDown className="size-3" />
              )}
              {Math.abs(delta)}%
            </span>
          )}
        </div>
      )}

      {hint && (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
