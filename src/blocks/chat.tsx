"use client";

import * as React from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { StatusBadge, type StatusTone } from "./status-badge";
import { useChatViewportShell } from "./chat-shell";
import type { ChatAskUser, ChatMessage, ChatToolCall } from "./chat-stream";

/**
 * Chat block 家族 —— AI 对话界面一次拼好。
 *
 * 90% 场景两行接完:
 *   const chat = useChatStream("/api/chat");
 *   <Chat {...chat} title="助手" examples={["帮我总结这份文档"]} />
 *
 * 不要自己写气泡/工具徽章的颜色 —— 全部走令牌, 换 --brand-h 与暗色模式自动跟随。
 */

export interface ChatProps {
  messages: ChatMessage[];
  loading: boolean;
  /** 发送一条 user 消息(useChatStream 的 send) */
  send: (text: string) => void | Promise<void>;
  /** ask_user 选项点击(useChatStream 的 pickOption) */
  pickOption?: (msgId: string, optionLabel: string) => void;
  /** 顶栏标题; 不传则不渲染顶栏 */
  title?: string;
  subtitle?: string;
  /** 空态示例 prompt, 点击即发送 */
  examples?: string[];
  /** 空态附加说明(额度提示这类) */
  emptyHint?: React.ReactNode;
  /** 输入框占位文案 */
  placeholder?: string;
  /** 每条 assistant 消息气泡下面的自定义扩展(app 专属按钮放这, 别改本包) */
  renderMessageExtra?: (msg: ChatMessage) => React.ReactNode;
  /**
   * 移动端整页外壳: 锁文档滚动 + visualViewport 接管高度,
   * 治 iOS 键盘遮输入框/顶栏飞走。**只给独立聊天页开**; 嵌 PageShell 的桌面工具别开。
   */
  shell?: boolean;
  className?: string;
}

export function Chat({
  messages,
  loading,
  send,
  pickOption,
  title,
  subtitle,
  examples = [],
  emptyHint,
  placeholder = "输入消息…(Enter 发送, Shift+Enter 换行)",
  renderMessageExtra,
  shell = false,
  className,
}: ChatProps) {
  const [input, setInput] = React.useState("");
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const nudgeRef = useChatViewportShell(rootRef, shell);

  // 只在用户本来就在底部时 auto-scroll, 且用瞬时滚动 —— smooth 会被流式 delta
  // 连续触发, 视觉上一直在抽搐(实测教训)。
  React.useEffect(() => {
    if (!isAtBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, isAtBottom]);

  function submit(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    void send(content);
    textareaRef.current?.focus();
  }

  const last = messages[messages.length - 1];
  const thinking = loading && last?.role === "assistant" && !last.content && !last.askUser;

  return (
    // Grid 三行是聊天布局的教科书做法: header 自适应 / 消息区独立滚 / 输入区自适应。
    // 比 flex+flex-1 可靠(min-h-0 陷阱)。父容器需给到高度(如 h-screen / h-full)。
    <div
      ref={rootRef}
      className={cn(
        // 浅灰底: 白气泡/纯白输入框从灰底上浮出来, 暗色=微抬升灰
        "grid h-full min-h-0 bg-muted/50 dark:bg-background",
        shell && "fixed inset-x-0 top-0 z-50 h-[100dvh]",  // z-50: 整页模式要压过宿主布局的 sticky 顶栏
        className,
      )}
      style={{ gridTemplateRows: "auto minmax(0,1fr) auto" }}
    >
      {title ? (
        <header className="flex items-center gap-2 border-b bg-card px-6 py-3">
          <Sparkles className="size-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold">{title}</h1>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </header>
      ) : (
        <div />
      )}

      <div
        ref={scrollRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
        }}
        className="overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 lg:px-6">
          {messages.length === 0 && (examples.length > 0 || emptyHint) && (
            <div className="my-6 rounded-xl border border-dashed bg-card p-5 text-sm text-muted-foreground">
              {examples.length > 0 && (
                <>
                  <div className="mb-2 font-medium text-foreground">你可以问我：</div>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => submit(p)}
                        disabled={loading}
                        className="rounded-full border bg-background px-3 py-1 text-xs hover:bg-accent disabled:opacity-50"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {emptyHint && <div className="mt-3 text-xs">{emptyHint}</div>}
            </div>
          )}

          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              msg={m}
              onPick={pickOption ? (label) => pickOption(m.id, label) : undefined}
              extra={renderMessageExtra?.(m)}
            />
          ))}

          {thinking && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> 思考中…
            </div>
          )}
        </div>
      </div>

      {/* 悬浮式输入(对齐主流 AI chat): 圆角容器浮在底部,
          发送键在框内右下 —— 不再是通栏 border-t 工具条。 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="px-4 pb-4 pt-1 lg:px-6"
        style={shell ? { paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" } : undefined}
      >
        <div
          className={cn(
            "relative mx-auto w-full max-w-3xl rounded-2xl border bg-white shadow-sm dark:bg-card",
            "transition-shadow focus-within:border-ring/60 focus-within:shadow-md",
            "focus-within:ring-2 focus-within:ring-ring/20",
          )}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            rows={2}
            disabled={loading}
            onFocus={() => nudgeRef.current()}
            className={cn(
              // pr 给框内发送键让位; bg-transparent 融进容器, 焦点样式由容器 focus-within 出
              "w-full resize-none bg-transparent py-3 pr-14 pl-4",
              // text-base(16px)防 iOS 聚焦自动放大整页(maximum-scale=1 会禁用户捏合, 违反 WCAG)
              "text-base sm:text-sm placeholder:text-muted-foreground",
              "focus:outline-none disabled:opacity-60",
            )}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="发送"
            className={cn(
              // 纯 icon 无边框无底色: 有字可发时亮成主色
              "absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center",
              "text-muted-foreground transition-colors",
              input.trim() && !loading ? "text-primary hover:text-primary/80" : "",
              "disabled:opacity-40",
            )}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

/** 单条消息(气泡 + 工具徽章 + ask_user 选项 + 错误态)。一般由 <Chat> 内部渲染。 */
export function ChatBubble({
  msg,
  onPick,
  extra,
}: {
  msg: ChatMessage;
  onPick?: (label: string) => void;
  extra?: React.ReactNode;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start gap-1.5">
      {msg.tools.length > 0 && <ChatToolList tools={msg.tools} />}
      {msg.error ? (
        <div className="max-w-[90%] rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive ring-1 ring-destructive/25">
          {msg.error}
        </div>
      ) : msg.content ? (
        <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-card px-4 py-2.5 text-sm whitespace-pre-wrap shadow-sm ring-1 ring-border">
          {msg.content}
        </div>
      ) : null}
      {msg.askUser && onPick && <ChatAskOptions ask={msg.askUser} onPick={onPick} />}
      {extra}
    </div>
  );
}

function toolTone(status: string): StatusTone {
  if (status === "running") return "info";
  if (status === "ok") return "success";
  if (status === "error" || status === "failed") return "danger";
  return "warning"; // ambiguous / not_found / 其它非致命异常
}

/** 工具调用徽章列 —— 状态语义色, 进行中带脉冲点。 */
export function ChatToolList({ tools }: { tools: ChatToolCall[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tools.map((t) => (
        <StatusBadge key={t.id} tone={toolTone(t.status)} dot pulse={t.status === "running"}>
          {t.name}
          {t.user_facing_message ? ` · ${t.user_facing_message}` : ""}
        </StatusBadge>
      ))}
    </div>
  );
}

/** ask_user: 助手抛出的选项按钮; 已回答后置灰。 */
export function ChatAskOptions({
  ask,
  onPick,
}: {
  ask: ChatAskUser;
  onPick: (label: string) => void;
}) {
  return (
    <div className="max-w-[90%] rounded-xl border bg-card px-4 py-3">
      <div className="mb-2 text-sm">{ask.question}</div>
      <div className="flex flex-wrap gap-2">
        {ask.options.map((o) => (
          <button
            key={o.id}
            type="button"
            disabled={ask.answered}
            onClick={() => onPick(o.label)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              ask.answered
                ? "opacity-50"
                : "bg-background hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
            )}
            title={o.hint}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
