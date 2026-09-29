# @pallet/ui — 组件手册

一套开箱即用的 UI 起步套件（设计系统 + 高层 block）。**做任何界面之前先读完这一份**，读完就够了，不需要再翻源码。

技术栈：Next.js（App Router）+ Tailwind v4 + shadcn/ui（new-york）+ Radix。

---

## 铁律

违反这几条会让全站观感崩掉，没有例外：

1. **只从 `@pallet/ui` 顶层导入。** 不要写 `@pallet/ui/src/components/ui/button`。
2. **不写死颜色。** 禁止 `#ff6200`、`text-blue-500`、`bg-gray-100`、`rgb(...)`。
   只用语义类：`bg-background` `text-foreground` `text-muted-foreground` `bg-card`
   `border-border` `bg-primary` `text-primary` `bg-muted` `bg-accent`
   `text-destructive` `text-success` `text-warning` `text-info`。
3. **换主色改 `--brand-h` 一个变量**，在 app 的 `globals.css` 里。不要逐个组件调色。
4. **优先用 block，不要用底层组件手搓。** 需要卡片就用 `Section`，不要写
   `<div className="rounded-lg border p-4">`；需要表格就用 `DataTable`，不要手写 `<table>`。
5. **不可逆操作必须用 `ConfirmButton`**，不要给 `Button` 直接挂 `onClick`。
6. **每个 app 的 `layout.tsx` 必须包 `PalletProvider`**，`<html>` 必须带 `suppressHydrationWarning`。
7. **数字用 `tabular-nums`**（block 内部已处理；自己写数字时记得加）。

---

## 接入一个 Next.js app

安装（`package.json` 依赖、`transpilePackages`、`@source`）见 [README.md](README.md)「用在你的项目里」。
接好之后照下面「标准骨架」写 `layout.tsx` / `frame.tsx` / `globals.css`。

---

## Block 速查

| Block | 用途 | 关键 props |
|---|---|---|
| `PalletProvider` | 主题+Tooltip+Toast 一次接好 | `children` |
| `PageShell` | 侧栏+顶栏+内容区外壳 | `app` `nav` `activePath` `linkAs` `width` |
| `PageHeader` | 页面标题区 | `title` `description` `actions` |
| `Section` | 卡片式分区（含分步序号） | `title` `description` `step` `actions` `flush` |
| `DataTable` | 数据表格全家桶 | `columns` `data` `searchKey` `selectable` `getRowId` |
| `StatCard` | KPI 数字卡 | `label` `value` `delta` `invertDelta` `icon` |
| `StatusBadge` | 语义状态徽章 | `tone` `dot` `pulse` |
| `LogStream` | 实时日志流 | `lines` `running` `height` |
| `UploadDrop` | 文件拖拽上传 | `onFile` `accept` `busy` |
| `ConfirmButton` | 带二次确认的按钮 | `onConfirm` `confirmTitle` `tone` |
| `Field` | 表单字段包装 | `label` `htmlFor` `hint` `error` `required` |
| `EmptyState` | 空状态 | `icon` `title` `description` `action` |
| `ThemeToggle` | 亮暗切换（PageShell 已自带） | 无 |
| `Chat` | AI 对话界面全家桶(气泡/工具徽章/ask_user/流式) | `messages` `loading` `send` `pickOption` `examples` |
| `useChatStream` | Chat 的状态+SSE 传输托管 hook | `endpoint` `maxHistory` `body` `transport` |
| `streamChat` | 底层 SSE 协议客户端(一般不直接用) | — |
| `useChatViewportShell` | 移动端聊天外壳 hook(Chat 的 shell prop 内部用) | `ref` `enabled` |

底层 shadcn 组件也全部从 `@pallet/ui` 导出：`Button` `Input` `Select` `Dialog`
`Tabs` `Alert` `Badge` `Card` `Checkbox` `Popover` `DropdownMenu` `Sheet`
`Skeleton` `Progress` `Avatar` `Separator` `ScrollArea` `Tooltip` `Command`
`Breadcrumb` `Table` `Sidebar*` `Chart*`，以及 `toast`、`cn`、`useTheme`、
`ColumnDef` 类型。

---

## 标准骨架

`app/layout.tsx`：

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PalletProvider } from "@pallet/ui";
import { Frame } from "@/components/frame";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "工具名", description: "一句话说明" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <PalletProvider>
          <Frame>{children}</Frame>
        </PalletProvider>
      </body>
    </html>
  );
}
```

`components/frame.tsx`（客户端组件，因为要用 `usePathname`）：

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, BarChart3 } from "lucide-react";
import { PageShell } from "@pallet/ui";

export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <PageShell
      app="工具名"
      appIcon={Package}
      linkAs={Link}              // 必须传，否则退化成整页跳转
      activePath={usePathname()}
      nav={[
        { label: "提交", href: "/", icon: Package },
        { label: "看板", href: "/board", icon: BarChart3 },
      ]}
    >
      {children}
    </PageShell>
  );
}
```

`app/globals.css`：

```css
@import "@pallet/ui/styles.css";
@source "../node_modules/@pallet/ui/src";   /* 路径相对本 CSS 文件，按你的目录层级调整 */

:root {
  --brand-h: 230;   /* 这个 app 的主色 */
}
```

---

## 各 block 用法

### PageShell

```tsx
<PageShell
  app="我的工具"
  appIcon={Package}
  linkAs={Link}
  activePath={pathname}
  width="wide"              // "default"(4xl) | "wide"(7xl) | "full"
  nav={[                    // 也可传分组：[{ label: "分组名", items: [...] }]
    { label: "提交", href: "/", icon: Send, badge: 3 },
  ]}
  actions={<Button size="sm">导出</Button>}   // ThemeToggle 已自动带上，别重复加
  topbar={<span>批次 #a3f9</span>}            // 顶栏左侧，默认显示 app 名
  sidebarFooter={<div className="p-2 text-xs">当前用户</div>}
/>
```

### Section

```tsx
<Section step={1} title="上传表格" description="支持 .xlsx / .xlsm">
  <UploadDrop accept=".xlsx" onFile={handle} />
</Section>

{/* 表格要铺满卡片时用 flush，自己控制内边距 */}
<Section title="结果" flush>
  <div className="px-5 py-4"><DataTable ... /></div>
</Section>
```

### DataTable

```tsx
import { DataTable, sortableHeader, type ColumnDef } from "@pallet/ui";

type Row = { id: string; owner: string; items: number };

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "id",
    header: sortableHeader("编号"),           // 需要排序就包一层
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
  },
  { accessorKey: "owner", header: "负责人", size: 80 },
  {
    accessorKey: "boxes",
    header: "条目",
    cell: ({ row }) => <span className="tabular-nums">{row.original.boxes}</span>,
  },
];

<DataTable
  columns={columns}
  data={rows}
  searchKey="id"                // 传了才出现搜索框
  selectable                    // 出现多选列
  defaultAllSelected            // 数据到达时默认全选
  getRowId={(r) => r.id}        // 多选时必传，否则排序后选中错位
  onSelectionChange={setSelected}
  pageSize={0}                  // 0 = 不分页；默认 20
  rowMuted={(r) => Boolean(r.error)}     // 行置灰
  empty={{ title: "还没有数据", description: "先上传表格。" }}
  toolbar={<Button size="sm">批量操作</Button>}
/>
```

### StatusBadge

六种 tone，**按语义选，不要按颜色选**：

```tsx
<StatusBadge tone="neutral" dot>未开始</StatusBadge>
<StatusBadge tone="info" dot pulse>提交中</StatusBadge>   {/* pulse = 正在跑 */}
<StatusBadge tone="success" dot>已完成</StatusBadge>
<StatusBadge tone="warning" dot>需注意</StatusBadge>
<StatusBadge tone="danger" dot>失败</StatusBadge>
<StatusBadge tone="brand" dot>重点</StatusBadge>
```

### LogStream

```tsx
<LogStream lines={logLines} running={isRunning} height={280} />
```

`lines` 传 `string[]` 即可，级别（错误红/警告黄/成功绿）由内容自动推断。
需要精确控制时传 `LogLine[]`：`{ text, level, time }`，`level` 为
`"info" | "success" | "warn" | "error" | "muted"`。
**`time` 必须传字符串**，不要在渲染时调 `new Date()`，会导致 hydration 不一致。

### StatCard

```tsx
<StatCard label="本周申请" value="317" delta={12} hint="较上周" icon={Package} />
{/* 下降是好事的指标（失败率、耗时）加 invertDelta */}
<StatCard label="失败率" value="6.6%" delta={-2.1} invertDelta icon={TriangleAlert} />
<StatCard label="加载中" value="—" loading />
```

### ConfirmButton

```tsx
<ConfirmButton
  confirmTitle={`确认提交 ${n} 条？`}
  confirmDescription="提交后无法撤销。"
  confirmLabel="确认提交"
  tone="destructive"            // 危险操作
  onConfirm={async () => {      // 返回 Promise 时按钮自动 loading
    await api.submit();
    toast.success("已提交");
  }}
>
  一键提交
</ConfirmButton>
```

### Field + 表单

```tsx
<Field label="收件邮箱" htmlFor="email" required
       hint="只用于标记批次归属"
       error={invalid ? "邮箱格式不正确" : undefined}>
  <Input id="email" type="email" value={v} onChange={...} />
</Field>
```

`htmlFor` 必须和控件 `id` 一致。有 `error` 时 `hint` 自动隐藏。

### 图表

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@pallet/ui";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const config = {
  申请: { label: "申请数", color: "var(--chart-1)" },   // 只用 --chart-1..5
  成功: { label: "成功数", color: "var(--chart-2)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-[260px] w-full">
  <BarChart data={data}>
    <CartesianGrid vertical={false} strokeDasharray="3 3" />
    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="申请" fill="var(--color-申请)" radius={[4, 4, 0, 0]} />
  </BarChart>
</ChartContainer>
```

`--chart-1..5` 由 `--brand-h` 等间隔派生，亮度彩度一致，任意组合都协调。
不要自己挑颜色。

### Chat（AI 对话）

```tsx
import { Chat, useChatStream } from "@pallet/ui";

export default function Page() {
  const chat = useChatStream("/api/chat");   // 状态全托管
  return (
    <div className="h-screen">
      <Chat
        {...chat}
        title="助手"
        subtitle="查文档 · 写总结"
        examples={["帮我搜一下关于部署的文档"]}
      />
    </div>
  );
}
```

- 父容器必须给高度，Chat 内部是 grid 三行独立滚。独立页用 `h-screen`;
  **放在 PageShell 里**用 `<div className="h-[calc(100dvh-3.5rem)] -mx-4 -my-6 sm:-mx-6">`
  (抵掉顶栏高度和 main 的内边距, 否则整页会被顶出滚动条)。
- app 专属的消息附加按钮（如「复制」「导出」）走 `renderMessageExtra={(msg)=>…}`，别改本包。
- 后端 SSE 协议（`data: {json}\n\n`）：`delta`(text) / `tool_call`(id,name,input) /
  `tool_result`(id,status,user_facing_message?) / `ask_user`(question,options) /
  `done`(success) / `error`(message)。协议定义在 `src/blocks/chat-stream.ts` 顶部注释。
- 工具徽章颜色按 status 自动走语义色：running=蓝(脉冲) ok=绿 error=红 其它=黄。
- mock 演示（无后端）照抄 `demo/src/app/chat/page.tsx`，把 `transport` 去掉即接真后端。
- **手机整页聊天必须开 `shell`**（`<Chat shell …/>`，见 `demo/src/app/chat-mobile/`）——
  外壳：锁文档滚动 + visualViewport 接管高度。治的四个 iOS 坑：
  聚焦放大整页(输入框已固定 16px)/键盘弹出顶栏飞走/键盘盖输入栏(Safari 的 dvh
  不跟键盘, WebKit #65)/刘海 home 条。嵌在 PageShell 里的桌面工具**不要开**（它锁整个文档）。

---

### Toast

```tsx
import { toast } from "@pallet/ui";
toast.success("已提交 6 条");
toast.error("提交失败：网络错误");
```

---

## 完整页面套路

「上传 → 勾选 → 提交 → 看日志」这类批处理工具，直接照抄
`demo/src/app/demo/page.tsx`。看板类照抄 `demo/src/app/page.tsx`。
**新页面先看这两个文件，不要从零开始。**

---

## 不要这样做

| ❌ | ✅ |
|---|---|
| `<div className="rounded-lg border p-4">` | `<Section>` |
| `className="bg-blue-500"` | `className="bg-primary"` |
| `className="text-gray-500"` | `className="text-muted-foreground"` |
| 手写 `<table>` | `<DataTable>` |
| 手写 dragover 上传 | `<UploadDrop>` |
| `<Button onClick={删除}>` | `<ConfirmButton onConfirm={删除}>` |
| 自己写 `<div>` 当空态 | `<EmptyState>` |
| `style={{ color: "#ff6200" }}` | 令牌类 |
| 每个 app 自定义圆角/阴影 | 用默认值 |
| `new Date().toLocaleTimeString()` 直接渲染 | 服务端算好传字符串 |
| 自己写聊天气泡/打字机/滚动逻辑 | `<Chat>` + `useChatStream` |
| 流式时 `scrollTo({behavior:"smooth"})` | Chat 已内置"在底部才瞬时滚"（smooth 会抽搐） |
| 手机聊天页自己算键盘高度/用 100dvh | `<Chat shell>`（iOS 上两者都会翻车, 见 chat-shell.ts 注释） |
| `maximum-scale=1` 防 iOS 聚焦缩放 | 输入框 16px（前者禁掉用户捏合, 违反 WCAG） |

---

## 令牌参考

主色旋钮（写在 app 的 `globals.css`）：

```
--brand-h:  265 靛紫 · 230 蓝 · 195 青 · 145 绿 · 60 琥珀 · 25 橙 · 350 玫红
```

亮度和彩度已锁定，任何色相角出来的观感质量一致。
**语义色（success / warning / danger / info）色相固定，不跟随主色**——
否则「成功」可能变红、「进行中」可能变黄。

阴影用 `shadow-xs/sm/md/lg`（已按暗色调过），圆角用 `rounded-md/lg/xl`。

---

## 维护

加新的 shadcn 组件：

```bash
npx shadcn@latest add <组件名>
npm run normalize-imports     # 必须！把 @/ 改成相对路径
```

第二步不能省：shadcn 生成的 `@/` 别名在使用方项目里会解析到对方的 `src`。
加完记得在 `src/index.ts` 里补一行 `export *`。

检查改动没破坏东西：

```bash
npm run typecheck
npm run typecheck --prefix demo
npm run demo                    # 打开 localhost:3100 目视确认
```
