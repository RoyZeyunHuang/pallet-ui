"use client";

import * as React from "react";
import { Chat, useChatStream } from "@pallet/ui";
import { mockTransport } from "./mock";

/**
 * Chat block 演示 —— mock 传输(./mock.ts), 不需要后端。
 * 真实接线只要把 transport 去掉、endpoint 指到你的 SSE 路由。
 * 移动端整页形态(shell=true)见 /chat-mobile。
 */


export default function ChatDemo() {
  const chat = useChatStream("/api/mock", { transport: mockTransport });
  return (
    // PageShell 的 main 自带 padding + 顶栏占 3.5rem —— Chat 要满高就把这两样抵掉。
    // 这是「PageShell 里放 Chat」的标准套路(见 AGENTS.md)。
    <div className="h-[calc(100dvh-3.5rem)] -mx-4 -my-6 sm:-mx-6">
      <Chat
        {...chat}
        title="助手 (demo)"
        subtitle="mock 传输 · 无后端"
        examples={[
          "帮我搜一下关于部署的文档",
          "给这周的进展写个总结",
          "那个项目名字我记模糊了",
        ]}
        emptyHint="演示页: transport 换成默认 streamChat 即接真后端。"
      />
    </div>
  );
}
