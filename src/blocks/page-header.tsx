import * as React from "react";
import { cn } from "../lib/utils";

// Omit "title"：DOM 的 title 属性是 string，与这里的 ReactNode 冲突
export interface PageHeaderProps
  extends Omit<React.ComponentProps<"div">, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** 右侧操作区，通常放 1–2 个按钮。 */
  actions?: React.ReactNode;
}

/** 页面标题区。每个页面顶部放一个，保证所有 app 的标题排版一致。 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
