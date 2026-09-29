# Pallet

开箱即用的 UI 起步套件：一套设计令牌 + 一组高层 block。目标：任何人（或任何 AI agent）
新做一个工具，界面直接达到商用水准，且所有工具之间观感一致。

名字取物流的「托盘」——一个托盘承载很多箱子，正好对应一套系统承载很多 app；
读音同 palette（调色板）。

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui (new-york) · Radix

---

## 核心设计：主色只有一个旋钮

所有颜色走 oklch，**亮度和彩度锁死，只有色相角可变**。每个 app 在自己的
`globals.css` 里改一个数字就换整套配色：

```css
@import "@pallet/ui/styles.css";

:root {
  --brand-h: 25;   /* 橙 */
}
```

| 色相角 | 颜色 |
|---|---|
| 265 | 靛紫（默认） |
| 230 | 蓝 |
| 195 | 青 |
| 145 | 绿 |
| 60 | 琥珀 |
| 25 | 橙 |
| 350 | 玫红 |

按钮、勾选框、聚焦环、侧栏高亮、图表配色、步骤序号全部跟着变，而且因为亮度彩度
一致，**任何色相出来的观感质量都相同**——配不出难看的组合。

**语义色（成功绿 / 警告黄 / 失败红 / 进行中蓝）色相固定，不跟随主色。**
否则换个主色，「成功」可能变成红色、「进行中」可能变成黄色，语义就毁了。

亮色/暗色两套令牌，`next-themes` 接管，默认跟随系统。

---

## 用在你的项目里

通过 git 依赖引用：

```bash
npm install github:RoyZeyunHuang/pallet-ui
```

`package.json`：

```json
{
  "dependencies": {
    "@pallet/ui": "github:RoyZeyunHuang/pallet-ui"
  }
}
```

`next.config.ts` —— 本包以 TypeScript 源码分发（不预编译），需要转译：

```ts
const nextConfig: NextConfig = {
  transpilePackages: ["@pallet/ui"],
};
```

`app/globals.css`：

```css
@import "@pallet/ui/styles.css";
@source "../../node_modules/@pallet/ui/src";   /* 让 Tailwind 扫到本包的类名 */

:root {
  --brand-h: 265;
}
```

`app/layout.tsx`：

```tsx
import { PalletProvider } from "@pallet/ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning 是 next-themes 要求的
    <html lang="zh" suppressHydrationWarning>
      <body><PalletProvider>{children}</PalletProvider></body>
    </html>
  );
}
```

---

## 组件

14 个高层 block（优先用这些）：

| Block | 用途 |
|---|---|
| `PalletProvider` | 主题 + Tooltip + Toast 一次接好 |
| `PageShell` | 可折叠侧栏 + 顶栏 + 内容区 |
| `PageHeader` | 页面标题区 |
| `Section` | 卡片式分区，支持分步序号 |
| `DataTable` | 排序/搜索/多选/分页/空态/骨架屏全内置 |
| `StatCard` | KPI 数字卡，带涨跌 |
| `StatusBadge` | 六种语义状态徽章 |
| `LogStream` | 实时日志流，级别自动配色、自动滚底 |
| `UploadDrop` | 文件拖拽上传 |
| `ConfirmButton` | 带二次确认的按钮 |
| `Field` | 表单字段包装 |
| `EmptyState` | 空状态 |
| `ThemeToggle` | 亮暗切换 |
| `Chat` + `useChatStream` | AI 对话界面全家桶(流式/工具徽章/ask_user), 两行接完; `shell` 开移动端整页外壳(治 iOS 键盘四坑) |

外加 25 个 shadcn 组件，全部从 `@pallet/ui` 顶层导出。

```tsx
import { PageShell, Section, DataTable, Button, toast } from "@pallet/ui";
```

完整签名、可粘贴示例和「不要这样做」对照表见 **[AGENTS.md](AGENTS.md)**。

---

## 本地开发

```bash
npm install
npm install --prefix demo
npm run demo          # localhost:3100，组件总览 + 实战示例 + Chat 演示
```

改动后：

```bash
npm run typecheck
npm run typecheck --prefix demo
```

加 shadcn 组件：

```bash
npx shadcn@latest add <组件名>
npm run normalize-imports     # 必须：把 @/ 别名改成相对路径
```

第二步不能省——`@/` 别名在使用方项目里会解析到对方的 `src`。
加完在 `src/index.ts` 补一行 `export *`。
