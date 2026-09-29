"use client";

import type { StreamChatOptions } from "@pallet/ui";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockTransport(
  _endpoint: string,
  message: string,
  _history: Array<{ role: string; content: string }>,
  opts: StreamChatOptions = {},
): Promise<string> {
  await sleep(300);
  let full = "";
  const type = async (text: string) => {
    for (const ch of text) {
      full += ch;
      opts.onDelta?.(full);
      await sleep(12);
    }
  };

  if (message.includes("搜") || message.includes("文档")) {
    opts.onToolCall?.({ id: "t1", name: "search_docs", input: {}, status: "running" });
    await sleep(700);
    opts.onToolResult?.({ id: "t1", status: "ok", user_facing_message: "命中 3 篇" });
    await type("找到 3 篇相关文档:\n\n快速开始 — 5 分钟跑起来\n部署指南 — Vercel / Docker\n常见问题 — 构建失败排查");
  } else if (message.includes("总结")) {
    opts.onToolCall?.({ id: "t2", name: "summarize", input: {}, status: "running" });
    await sleep(900);
    opts.onToolResult?.({ id: "t2", status: "ok" });
    await type("本周进展(演示数据):\n\n完成 12 项任务, 修复 3 个问题, 下周重点是上线前的回归测试。");
  } else if (message.includes("模糊")) {
    opts.onToolCall?.({ id: "t3", name: "find_project", input: {}, status: "running" });
    await sleep(600);
    opts.onToolResult?.({ id: "t3", status: "ambiguous", user_facing_message: "匹配到 2 个" });
    opts.onAskUser?.({
      question: "你说的是哪一个?",
      options: [
        { id: "a", label: "Project Alpha" },
        { id: "b", label: "Project Alpine" },
      ],
    });
  } else {
    await type(`收到:「${message}」。这是 mock 回复 —— 试试点下面的示例, 或输入包含「模糊」的问题看 ask_user 效果。`);
  }
  return full;
}
