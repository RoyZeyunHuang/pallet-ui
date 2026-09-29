"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { StatusBadge } from "./status-badge";

export type LogLevel = "info" | "success" | "warn" | "error" | "muted";

export interface LogLine {
  text: string;
  level?: LogLevel;
  /** 时间戳，传字符串避免服务端/客户端渲染不一致。 */
  time?: string;
}

const LEVEL_CLASS: Record<LogLevel, string> = {
  info: "text-foreground",
  success: "text-success",
  warn: "text-warning-foreground dark:text-warning",
  error: "text-destructive",
  muted: "text-muted-foreground",
};

/** 按内容猜日志级别，省得调用方逐行标注。 */
export function inferLevel(text: string): LogLevel {
  if (/失败|错误|error|failed|exception|traceback/i.test(text)) return "error";
  if (/警告|注意|warn|验证码|captcha|跳过/i.test(text)) return "warn";
  if (/成功|完成|done|success|✔|✓/i.test(text)) return "success";
  if (/^\s*(——|--|==)/.test(text)) return "muted";
  return "info";
}

export interface LogStreamProps extends React.ComponentProps<"div"> {
  /** 传字符串数组即可，级别会自动推断；也可传 LogLine 精确控制。 */
  lines: (string | LogLine)[];
  /** 是否正在运行——显示脉冲指示灯。 */
  running?: boolean;
  /** 新行到达时自动滚到底部；用户手动上滚后会暂停，回到底部后恢复。 */
  autoScroll?: boolean;
  height?: number | string;
  /** 无日志时的占位文案。 */
  placeholder?: string;
}

/**
 * 实时日志流。等宽字体、级别配色、自动滚底。
 * 长任务（提交、抓取、批处理）的进度展示统一用它。
 */
export function LogStream({
  lines,
  running = false,
  autoScroll = true,
  height = 360,
  placeholder = "等待输出…",
  className,
  ...props
}: LogStreamProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = React.useState(true);

  const onScroll = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // 距底部 24px 内视为「贴底」，用户上滚查看历史时不再打断
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
  }, []);

  React.useEffect(() => {
    if (!autoScroll || !pinned) return;
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, autoScroll, pinned]);

  const normalized: LogLine[] = React.useMemo(
    () =>
      lines.map((l) =>
        typeof l === "string"
          ? { text: l, level: inferLevel(l) }
          : { ...l, level: l.level ?? inferLevel(l.text) },
      ),
    [lines],
  );

  return (
    <div
      className={cn("overflow-hidden rounded-lg border bg-muted/30", className)}
      {...props}
    >
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          运行日志
        </span>
        <div className="flex items-center gap-2">
          {!pinned && autoScroll && (
            <button
              type="button"
              onClick={() => {
                setPinned(true);
                const el = ref.current;
                if (el) el.scrollTop = el.scrollHeight;
              }}
              className="text-xs text-primary hover:underline"
            >
              回到底部
            </button>
          )}
          <StatusBadge
            tone={running ? "info" : "neutral"}
            dot
            pulse={running}
          >
            {running ? "运行中" : "空闲"}
          </StatusBadge>
        </div>
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        style={{ height }}
        className="overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed"
      >
        {normalized.length === 0 ? (
          <p className="py-6 text-center text-muted-foreground">{placeholder}</p>
        ) : (
          normalized.map((line, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 py-px whitespace-pre-wrap",
                LEVEL_CLASS[line.level ?? "info"],
              )}
            >
              {line.time && (
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {line.time}
                </span>
              )}
              <span className="min-w-0 break-words">{line.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
