import * as React from "react";
import { cn } from "../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "../components/ui/card";

// Omit "title"：DOM 的 title 属性是 string，与这里的 ReactNode 冲突
export interface SectionProps
  extends Omit<React.ComponentProps<typeof Card>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** 标题左侧的步骤序号，用于「第 1 步 / 第 2 步」这类分步流程。 */
  step?: number;
  /** 标题右侧的操作区。 */
  actions?: React.ReactNode;
  /** 去掉内容区内边距，表格铺满卡片时用。 */
  flush?: boolean;
}

/**
 * 卡片式内容分区。分步表单、设置面板、表格容器统一用它，
 * 不要自己写 <div className="border rounded p-4">。
 */
export function Section({
  title,
  description,
  step,
  actions,
  flush = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)} {...props}>
      {(title || actions) && (
        <div className="flex items-start gap-3 border-b px-5 py-4">
          {step !== undefined && (
            <span
              aria-hidden
              className="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums"
            >
              {step}
            </span>
          )}
          <div className="min-w-0 flex-1 space-y-1">
            {title && <CardTitle className="text-base">{title}</CardTitle>}
            {description && (
              <CardDescription className="text-pretty">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <CardContent className={cn(flush ? "p-0" : "px-5 py-4")}>
        {children}
      </CardContent>
    </Card>
  );
}
