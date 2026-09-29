"use client";

import * as React from "react";

/**
 * Chat 流式协议 —— UI 与后端的唯一契约(SSE, `data: {json}\n\n`)。
 *
 * 服务端逐事件发:
 *   {type:"delta", text:"…"}                              增量正文
 *   {type:"tool_call", id, name, input}                   工具开始(UI 记 running)
 *   {type:"tool_result", id, status, user_facing_message?, candidates?}
 *   {type:"ask_user", question, options:[{id,label,hint?}]}
 *   {type:"done", success:true}
 *   {type:"error", message}
 *
 * 改协议要同时改这里和 AGENTS.md。
 */

export type ChatToolCall = {
  id: string;
  name: string;
  input: Record<string, unknown>;
  /** "running" | "ok" | "error" | 其它自定义(ambiguous/not_found…按警示渲染) */
  status: string;
  user_facing_message?: string;
  candidates?: Array<{ id: string; label: string; hint?: string }>;
};

export type ChatAskUser = {
  question: string;
  options: Array<{ id: string; label: string; hint?: string }>;
  answered: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools: ChatToolCall[];
  askUser?: ChatAskUser;
  error?: string;
};

export interface StreamChatOptions {
  /** 追加进请求体的字段(除 message / conversation_history 外) */
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onDelta?: (fullText: string) => void;
  onToolCall?: (tool: ChatToolCall) => void;
  onToolResult?: (tool: Partial<ChatToolCall> & { id: string }) => void;
  onAskUser?: (ask: Omit<ChatAskUser, "answered">) => void;
}

/**
 * 底层协议客户端: POST endpoint 并消费上面的 SSE 事件流。
 * 一般不直接用 —— 用 useChatStream。返回最终完整正文。
 */
export async function streamChat(
  endpoint: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  opts: StreamChatOptions = {},
): Promise<string> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
    body: JSON.stringify({
      message,
      conversation_history: history,
      ...(opts.body ?? {}),
    }),
    signal: opts.signal,
  });
  if (!res.ok) {
    const errJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errJson.error || `HTTP ${res.status}`);
  }
  if (!res.body) throw new Error("无响应体");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let assembled = "";

  readLoop: for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    for (;;) {
      const sep = buf.indexOf("\n\n");
      if (sep === -1) break;
      const raw = buf.slice(0, sep).trim();
      buf = buf.slice(sep + 2);
      if (!raw.startsWith("data: ")) continue;
      let p: Record<string, unknown>;
      try {
        p = JSON.parse(raw.slice(6)) as Record<string, unknown>;
      } catch {
        continue;
      }
      const type = p.type as string | undefined;
      if (type === "delta" && typeof p.text === "string") {
        assembled += p.text;
        opts.onDelta?.(assembled);
      } else if (type === "tool_call" && p.name && p.id) {
        opts.onToolCall?.({
          id: String(p.id),
          name: String(p.name),
          input: (p.input as Record<string, unknown>) ?? {},
          status: "running",
        });
      } else if (type === "tool_result" && p.id) {
        opts.onToolResult?.({
          id: String(p.id),
          status: (p.status as string) ?? "ok",
          user_facing_message: p.user_facing_message as string | undefined,
          candidates: p.candidates as ChatToolCall["candidates"],
        });
      } else if (type === "ask_user" && p.question) {
        opts.onAskUser?.({
          question: String(p.question),
          options: (p.options as ChatAskUser["options"]) ?? [],
        });
      } else if (type === "done") {
        if (!p.success) throw new Error("助手未正常结束回复");
        break readLoop;
      } else if (type === "error") {
        throw new Error((p.message as string) || "流式输出失败");
      }
    }
  }
  return assembled;
}

export interface UseChatStreamOptions {
  /** 送给后端的对话历史条数上限 */
  maxHistory?: number;
  /** 追加进每次请求体的字段 */
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  /** 把异常翻译成给用户看的文案(默认取 err.message) */
  formatError?: (err: unknown) => string;
  /** 自定义传输(测试/mock 用): 与 streamChat 同签名 */
  transport?: typeof streamChat;
}

/**
 * 90% 场景用这个: 状态全托管, 返回值直接铺给 <Chat />。
 *
 *   const chat = useChatStream("/api/chat");
 *   return <Chat {...chat} examples={["帮我总结这份文档"]} />;
 */
export function useChatStream(endpoint: string, opts: UseChatStreamOptions = {}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const optsRef = React.useRef(opts);
  optsRef.current = opts;
  // 重入闸必须用 ref —— 不要用 setState(updater) 读旧值当闸:
  // React 只在该 hook 队列为空时才急切求值 updater, 跟在别的 setState 后面的
  // 发送(ask_user 选项点击)会被静默吞掉(2026-08-13 demo 实测)。
  const busyRef = React.useRef(false);

  const send = React.useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busyRef.current) return;
      busyRef.current = true;
      setLoading(true);
      const o = optsRef.current;
      const assistantId = crypto.randomUUID();
      let history: Array<{ role: string; content: string }> = [];
      setMessages((prev) => {
        history = prev
          .slice(-(o.maxHistory ?? 12))
          .filter((m) => m.role === "user" || (m.role === "assistant" && m.content.trim()))
          .map((m) => ({ role: m.role, content: m.content }));
        return [
          ...prev,
          { id: crypto.randomUUID(), role: "user", content, tools: [] },
          { id: assistantId, role: "assistant", content: "", tools: [] },
        ];
      });
      const patch = (fn: (m: ChatMessage) => ChatMessage) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? fn(m) : m)));
      try {
        const transport = o.transport ?? streamChat;
        await transport(endpoint, content, history, {
          body: o.body,
          headers: o.headers,
          onDelta: (full) => patch((m) => ({ ...m, content: full })),
          onToolCall: (t) => patch((m) => ({ ...m, tools: [...m.tools, t] })),
          onToolResult: (r) =>
            patch((m) => ({
              ...m,
              tools: m.tools.map((t) => (t.id === r.id ? { ...t, ...r } : t)),
            })),
          onAskUser: (a) => patch((m) => ({ ...m, askUser: { ...a, answered: false } })),
        });
      } catch (err) {
        const fmt = optsRef.current.formatError;
        patch((m) => ({
          ...m,
          error: fmt ? fmt(err) : err instanceof Error ? err.message : String(err),
        }));
      } finally {
        busyRef.current = false;
        setLoading(false);
      }
    },
    [endpoint],
  );

  /** ask_user 选项点击: 标记已答 + 作为新 user 消息发出 */
  const pickOption = React.useCallback(
    (msgId: string, optionLabel: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.askUser
            ? { ...m, askUser: { ...m.askUser, answered: true } }
            : m,
        ),
      );
      void send(optionLabel);
    },
    [send],
  );

  const reset = React.useCallback(() => setMessages([]), []);

  return { messages, loading, send, pickOption, reset };
}
