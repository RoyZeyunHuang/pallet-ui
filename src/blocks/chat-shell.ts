"use client";

import * as React from "react";

/**
 * 移动端聊天外壳 hook。
 *
 * 所有 chat 组件库都只管气泡, 没人管外壳; 而手机上翻车的从来是外壳
 * (真机踩坑得来)。它解决四个经典坑:
 *   1. 点输入框 iOS 自动放大整页   → 输入框 font-size ≥16px(chat.tsx 里保证)
 *   2. 键盘弹出顶栏飞走/结构错位   → 锁死文档滚动, 消息列表是唯一滚动容器
 *   3. 键盘遮住输入框(iOS dvh 不动) → 容器高度=visualViewport.height + translateY
 *   4. 刘海/home 条压内容          → safe-area(chat.tsx 的 composer padding)
 *
 * ★为什么不算键盘高度: iOS 锁滚后改用「可视视口平移」露输入框, offsetTop 变正数,
 *   innerHeight−vv.height−offsetTop 的减法归零 → 补偿失效(真机实测输入栏被整个
 *   盖住, 差 336px)。直接把容器变成「用户此刻能看见的那块区域」就全兼容了。
 * ★为什么不能只用 100dvh: Safari 没实现 interactive-widget, iOS 键盘弹出时
 *   100dvh 纹丝不动(WebKit standards-positions#65)。Android 无所谓, iOS 必须这套。
 * ★为什么不用 maximum-scale=1: 会连用户主动捏合缩放一起禁掉, 违反 WCAG。
 *
 * 只给「整页聊天」用(Chat 的 shell prop); 嵌在 PageShell 里的桌面工具别开 ——
 * 它会锁整个文档的滚动。
 */
export function useChatViewportShell(
  appRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const nudgeRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    if (!enabled) return;
    const app = appRef.current;
    const vv = window.visualViewport;
    if (!app) return;

    // 锁死文档滚动: html overflow hidden + body fixed。保存原值, 卸载时还原。
    const html = document.documentElement;
    const saved = {
      htmlOverflow: html.style.overflow,
      bodyPosition: document.body.style.position,
      bodyInset: document.body.style.inset,
      bodyWidth: document.body.style.width,
    };
    html.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.inset = "0";
    document.body.style.width = "100%";

    let lastH = 0;
    let lastTop = 0;

    function sync() {
      if (!vv) return;
      if (vv.scale > 1.02) return; // 捏合缩放中, 别动布局
      const h = Math.round(vv.height);
      const top = Math.round(vv.offsetTop);
      if (h !== lastH || top !== lastTop) {
        lastH = h;
        lastTop = top;
        app!.style.height = `${h}px`;
        app!.style.transform = top ? `translateY(${top}px)` : "";
      }
      // iOS 仍会在聚焦瞬间偷偷把文档滚一下, 拽回来
      if (window.scrollY !== 0 || window.scrollX !== 0) window.scrollTo(0, 0);
    }

    // iOS 键盘动画 ~300ms, 期间 vv 连续 resize; 多补几拍别只吃到中间帧
    function nudge() {
      [0, 50, 120, 250, 400, 650].forEach((t) => setTimeout(sync, t));
    }
    nudgeRef.current = nudge;

    const onOrient = () => setTimeout(sync, 350);
    const onFocusOut = () => {
      setTimeout(sync, 60);
      setTimeout(sync, 320);
    };
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    window.addEventListener("orientationchange", onOrient);
    window.addEventListener("focusout", onFocusOut);
    sync();

    return () => {
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      window.removeEventListener("orientationchange", onOrient);
      window.removeEventListener("focusout", onFocusOut);
      html.style.overflow = saved.htmlOverflow;
      document.body.style.position = saved.bodyPosition;
      document.body.style.inset = saved.bodyInset;
      document.body.style.width = saved.bodyWidth;
      app.style.height = "";
      app.style.transform = "";
      nudgeRef.current = () => {};
    };
  }, [enabled, appRef]);

  return nudgeRef;
}
