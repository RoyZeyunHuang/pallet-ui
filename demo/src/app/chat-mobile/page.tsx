"use client";

import { Chat, useChatStream } from "@pallet/ui";

/**
 * 移动端整页聊天(shell=true)演示 —— 外壳:
 * 锁文档滚动 / visualViewport 接管高度 / 键盘弹出输入栏永远可见 / safe-area。
 * 手机上开这页测: 聚焦输入框不放大、顶栏不飞、输入栏不被键盘盖。
 * mock 传输同 /chat(这里演示接真后端的形态, 直接用默认 streamChat 也行)。
 */
import { mockTransport } from "../chat/mock";

export default function MobileChatDemo() {
  const chat = useChatStream("/api/mock", { transport: mockTransport });
  return (
    <Chat
      {...chat}
      shell
      title="助手"
      subtitle="移动端外壳 demo"
      examples={["帮我搜一下关于部署的文档", "那个项目名字我记模糊了"]}
    />
  );
}
