"use client";

import * as React from "react";
import { FileSpreadsheet, Send, TriangleAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  ConfirmButton,
  DataTable,
  Field,
  Input,
  LogStream,
  PageHeader,
  Section,
  StatusBadge,
  UploadDrop,
  sortableHeader,
  toast,
  type ColumnDef,
} from "@pallet/ui";

type Row = {
  id: string;
  owner: string;
  name: string;
  items: number;
  note?: string;
};

const PARSED: Row[] = [
  { id: "REC-2001", owner: "Alice", name: "季度汇总 A", items: 6 },
  { id: "REC-2002", owner: "Bob", name: "季度汇总 B", items: 2 },
  { id: "REC-2003", owner: "Alice", name: "月度明细", items: 11 },
  { id: "REC-2004", owner: "Carol", name: "客户清单", items: 4 },
  {
    id: "REC-2005",
    owner: "Bob",
    name: "历史归档",
    items: 8,
    note: "缺少必填字段",
  },
];

const columns: ColumnDef<Row, unknown>[] = [
  {
    accessorKey: "id",
    header: sortableHeader("编号"),
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.id}</span>
    ),
  },
  { accessorKey: "owner", header: "负责人", size: 80 },
  { accessorKey: "name", header: "名称" },
  {
    accessorKey: "items",
    header: sortableHeader("条目"),
    size: 80,
    cell: ({ row }) => <span className="tabular-nums">{row.original.items}</span>,
  },
  {
    id: "note",
    header: "说明",
    cell: ({ row }) =>
      row.original.note ? (
        <StatusBadge tone="warning">{row.original.note}</StatusBadge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
];

export default function DemoPage() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [selected, setSelected] = React.useState<Row[]>([]);
  const [parsing, setParsing] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [log, setLog] = React.useState<string[]>([]);
  const [running, setRunning] = React.useState(false);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  async function submit() {
    setRunning(true);
    setLog([`—— 开始执行（${email}）——`]);
    for (const [i, r] of selected.entries()) {
      await new Promise((res) => setTimeout(res, 550));
      setLog((p) => [
        ...p,
        `[${i + 1}/${selected.length}] ${r.id} → 开始处理`,
      ]);
      await new Promise((res) => setTimeout(res, 450));
      setLog((p) => [
        ...p,
        r.note
          ? `[${i + 1}/${selected.length}] ${r.id} 失败：${r.note}`
          : `[${i + 1}/${selected.length}] ${r.id} 处理完成 ✓`,
      ]);
    }
    setLog((p) => [...p, "—— 全部完成 ——"]);
    setRunning(false);
    toast.success("批次执行完毕");
  }

  return (
    <>
      <PageHeader
        title="批量处理示例"
        description="「上传 → 勾选 → 提交 → 看日志」的标准流程。整页用 @pallet/ui 的 block 拼成，几乎没写样式代码。"
      />

      <Alert>
        <TriangleAlert />
        <AlertTitle>测试模式已开启</AlertTitle>
        <AlertDescription>
          这是演示页，所有数据都是假的，提交不会发出任何请求。
        </AlertDescription>
      </Alert>

      <Section
        step={1}
        title="上传文件"
        description="支持 .xlsx / .csv，上传后自动解析出待处理的记录。"
      >
        <UploadDrop
          accept=".xlsx,.csv"
          busy={parsing}
          busyLabel="解析中…"
          onFile={(f) => {
            setParsing(true);
            setTimeout(() => {
              setParsing(false);
              setRows(PARSED);
              toast.success(`已从 ${f.name} 解析出 ${PARSED.length} 条`);
            }, 1100);
          }}
        />
      </Section>

      <Section
        step={2}
        title="勾选要处理的记录"
        description={
          rows.length
            ? `共解析出 ${rows.length} 条，默认全选。`
            : "上传文件后这里会显示待处理的记录。"
        }
        flush
      >
        <div className="px-5 py-4">
          <DataTable
            columns={columns}
            data={rows}
            searchKey="id"
            searchPlaceholder="搜编号…"
            selectable
            defaultAllSelected
            getRowId={(r) => r.id}
            onSelectionChange={setSelected}
            pageSize={0}
            rowMuted={(r) => Boolean(r.note)}
            empty={{
              title: "还没有数据",
              description: "先在上一步上传文件。",
            }}
          />
        </div>
      </Section>

      <Section
        step={3}
        title="填写邮箱并提交"
        description="邮箱只用于标记这批任务属于谁。"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Field
            label="邮箱"
            htmlFor="email"
            required
            className="flex-1"
            error={email && !emailValid ? "邮箱格式不正确" : undefined}
          >
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>
          <ConfirmButton
            disabled={!emailValid || selected.length === 0 || running}
            confirmTitle={`确认提交 ${selected.length} 条？`}
            confirmDescription="演示页，不会发出任何真实请求。"
            confirmLabel="确认提交"
            onConfirm={submit}
          >
            <Send className="size-4" />
            一键提交
          </ConfirmButton>
        </div>
      </Section>

      {(running || log.length > 0) && (
        <Section title="提交进度" flush>
          <div className="px-5 py-4">
            <LogStream lines={log} running={running} height={260} />
          </div>
        </Section>
      )}

      {rows.length === 0 && (
        <p className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="size-3.5" />
          提示：随便拖一个文件进去就能看到完整流程
        </p>
      )}
    </>
  );
}
