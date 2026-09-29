"use client";

import * as React from "react";
import {
  CircleCheck,
  CircleDollarSign,
  Inbox,
  ListChecks,
  Rocket,
  TriangleAlert,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ConfirmButton,
  DataTable,
  EmptyState,
  Field,
  Input,
  LogStream,
  PageHeader,
  Section,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatusBadge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  UploadDrop,
  sortableHeader,
  toast,
  type ChartConfig,
  type ColumnDef,
} from "@pallet/ui";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

// ————————————————— 假数据 —————————————————

type Task = {
  id: string;
  owner: string;
  project: string;
  items: number;
  status: "queued" | "running" | "done" | "failed";
  amount: number;
};

const TASKS: Task[] = [
  { id: "TASK-1001", owner: "Alice", project: "Alpha", items: 6, status: "done", amount: 412 },
  { id: "TASK-1002", owner: "Bob", project: "Beta", items: 2, status: "done", amount: 96 },
  { id: "TASK-1003", owner: "Alice", project: "Gamma", items: 11, status: "running", amount: 0 },
  { id: "TASK-1004", owner: "Carol", project: "Alpha", items: 4, status: "queued", amount: 0 },
  { id: "TASK-1005", owner: "Bob", project: "Delta", items: 8, status: "failed", amount: 0 },
  { id: "TASK-1006", owner: "Carol", project: "Beta", items: 3, status: "done", amount: 158 },
];

const STATUS: Record<
  Task["status"],
  { label: string; tone: React.ComponentProps<typeof StatusBadge>["tone"]; pulse?: boolean }
> = {
  queued: { label: "排队中", tone: "neutral" },
  running: { label: "处理中", tone: "info", pulse: true },
  done: { label: "已完成", tone: "success" },
  failed: { label: "失败", tone: "danger" },
};

const columns: ColumnDef<Task, unknown>[] = [
  {
    accessorKey: "id",
    header: sortableHeader("编号"),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  { accessorKey: "owner", header: "负责人", size: 80 },
  { accessorKey: "project", header: "项目" },
  {
    accessorKey: "items",
    header: sortableHeader("条目"),
    size: 80,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.items}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "状态",
    size: 110,
    cell: ({ row }) => {
      const s = STATUS[row.original.status];
      return (
        <StatusBadge tone={s.tone} dot pulse={s.pulse}>
          {s.label}
        </StatusBadge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: sortableHeader("金额"),
    size: 90,
    cell: ({ row }) =>
      row.original.amount > 0 ? (
        <span className="font-medium text-success tabular-nums">
          ${row.original.amount}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

const CHART_DATA = [
  { day: "周一", 提交: 42, 成功: 38 },
  { day: "周二", 提交: 55, 成功: 51 },
  { day: "周三", 提交: 37, 成功: 30 },
  { day: "周四", 提交: 68, 成功: 64 },
  { day: "周五", 提交: 91, 成功: 82 },
  { day: "周六", 提交: 24, 成功: 22 },
];

const CHART_CONFIG = {
  提交: { label: "提交数", color: "var(--chart-1)" },
  成功: { label: "成功数", color: "var(--chart-2)" },
} satisfies ChartConfig;

const SAMPLE_LOG = [
  "—— 开始执行（user@example.com）——",
  "[1/6] TASK-1001 → 开始处理",
  "[1/6] 处理完成 ✓",
  "[2/6] TASK-1002 → 处理完成 ✓",
  "[3/6] TASK-1003 → 注意：响应较慢，已自动重试",
  "[3/6] 重试成功，继续",
  "[4/6] TASK-1004 → 排队中",
  "[5/6] TASK-1005 → 失败：输入数据格式不正确",
];

// ————————————————— 页面 —————————————————

export default function Page() {
  const [selected, setSelected] = React.useState<Task[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [running, setRunning] = React.useState(false);
  const [logLines, setLogLines] = React.useState<string[]>(SAMPLE_LOG.slice(0, 3));

  // 演示日志流的滚动效果
  React.useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLogLines((prev) =>
        prev.length >= SAMPLE_LOG.length
          ? prev
          : [...prev, SAMPLE_LOG[prev.length]],
      );
    }, 900);
    return () => clearInterval(t);
  }, [running]);

  return (
    <>
      <PageHeader
        title="组件总览"
        description="所有页面共用这一套。右上角调色盘可实时切换主色——每个 app 只需在 globals.css 里改一个数字。"
        actions={
          <Button onClick={() => toast.success("这是一条 toast 通知")}>
            <Rocket className="size-4" />
            试一下 Toast
          </Button>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="本周任务" value="317" delta={12} hint="较上周" icon={ListChecks} />
        <StatCard label="成功率" value="93.4%" delta={2.1} hint="较上周" icon={CircleCheck} />
        <StatCard
          label="累计金额"
          value="$8,240"
          delta={18}
          hint="本月至今"
          icon={CircleDollarSign}
        />
        <StatCard
          label="失败率"
          value="6.6%"
          delta={-2.1}
          invertDelta
          hint="下降是好事"
          icon={TriangleAlert}
        />
      </div>

      <Section
        title="数据表格"
        description="排序、搜索、多选、分页、空态、加载骨架都内置。列定义即用，不用每次重写。"
      >
        <DataTable
          columns={columns}
          data={TASKS}
          searchKey="id"
          searchPlaceholder="搜编号…"
          selectable
          defaultAllSelected
          getRowId={(r) => r.id}
          onSelectionChange={setSelected}
          pageSize={0}
          rowMuted={(r) => r.status === "failed"}
          toolbar={
            <ConfirmButton
              size="sm"
              disabled={selected.length === 0}
              confirmTitle={`确认提交 ${selected.length} 项？`}
              confirmDescription="提交后无法撤销（演示页不会真的提交）。"
              confirmLabel="确认提交"
              onConfirm={async () => {
                await new Promise((r) => setTimeout(r, 900));
                toast.success(`已提交 ${selected.length} 项`);
              }}
            >
              提交所选（{selected.length}）
            </ConfirmButton>
          }
        />
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section step={1} title="上传文件" description="拖拽或点击，带 hover 与处理中状态。">
          <UploadDrop
            accept=".xlsx,.xlsm"
            busy={busy}
            busyLabel="解析中…"
            hint="支持 .xlsx / .xlsm，单文件不超过 10 MB"
            onFile={(f) => {
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                toast.success(`已解析 ${f.name}`);
              }, 1200);
            }}
          />
        </Section>

        <Section
          title="运行日志"
          description="等宽字体、级别自动配色、自动滚底（手动上滚会暂停）。"
          actions={
            <Button
              size="sm"
              variant={running ? "secondary" : "default"}
              onClick={() => {
                if (!running) setLogLines(SAMPLE_LOG.slice(0, 3));
                setRunning((v) => !v);
              }}
            >
              {running ? "停止" : "开始演示"}
            </Button>
          }
        >
          <LogStream lines={logLines} running={running} height={220} />
        </Section>
      </div>

      <Section title="图表" description="图表色由令牌派生，换主色时自动跟着变，永远协调。">
        <ChartContainer config={CHART_CONFIG} className="h-[260px] w-full">
          <BarChart data={CHART_DATA}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="申请" fill="var(--color-申请)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="成功" fill="var(--color-成功)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="状态与按钮">
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="neutral" dot>未开始</StatusBadge>
              <StatusBadge tone="info" dot pulse>进行中</StatusBadge>
              <StatusBadge tone="success" dot>已完成</StatusBadge>
              <StatusBadge tone="warning" dot>需注意</StatusBadge>
              <StatusBadge tone="danger" dot>失败</StatusBadge>
              <StatusBadge tone="brand" dot>重点</StatusBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button>主要</Button>
              <Button variant="secondary">次要</Button>
              <Button variant="outline">描边</Button>
              <Button variant="ghost">幽灵</Button>
              <Button variant="destructive">危险</Button>
              <Button disabled>禁用</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Alert>
              <TriangleAlert />
              <AlertTitle>测试模式已开启</AlertTitle>
              <AlertDescription>
                操作只做校验，不会写入任何真实数据。
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        <Section title="表单与空态">
          <Tabs defaultValue="form">
            <TabsList className="mb-4">
              <TabsTrigger value="form">表单</TabsTrigger>
              <TabsTrigger value="empty">空态</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="space-y-4">
              <Field
                label="邮箱"
                htmlFor="email"
                required
                hint="只用于标记这批任务属于谁。"
              >
                <Input id="email" type="email" placeholder="name@example.com" />
              </Field>
              <Field label="提交次数" htmlFor="qty" error="必须在 1–20 之间">
                <Select defaultValue="20">
                  <SelectTrigger id="qty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">每项 1 次</SelectItem>
                    <SelectItem value="10">每项 10 次</SelectItem>
                    <SelectItem value="20">每项 20 次</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </TabsContent>
            <TabsContent value="empty">
              <EmptyState
                icon={Inbox}
                title="还没有数据"
                description="上传文件后，这里会显示待处理的条目。"
                action={<Button size="sm">上传文件</Button>}
              />
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </>
  );
}
