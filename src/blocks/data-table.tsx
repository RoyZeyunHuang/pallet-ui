"use client";

import * as React from "react";
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { EmptyState } from "./empty-state";

export interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  /** 传字段名即出现搜索框，按该字段过滤。 */
  searchKey?: keyof T & string;
  searchPlaceholder?: string;
  /** 开启多选。配合 onSelectionChange 拿到选中行。 */
  selectable?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  /** 默认全选（selectable 时生效）。勾选类批处理流程通常要这个。 */
  defaultAllSelected?: boolean;
  /** 稳定行 id。开启多选时强烈建议传，否则排序后选中会错位。 */
  getRowId?: (row: T, index: number) => string;
  /** 每页行数，传 0 关闭分页。 */
  pageSize?: number;
  loading?: boolean;
  /** 空态文案。 */
  empty?: { title: React.ReactNode; description?: React.ReactNode };
  /** 搜索框右侧的操作区。 */
  toolbar?: React.ReactNode;
  /** 行是否置灰（例如被排除的项）。 */
  rowMuted?: (row: T) => boolean;
  className?: string;
}

/** 可排序表头。列定义里写 header: sortableHeader("名称") 即可。 */
export function sortableHeader(label: React.ReactNode) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function SortableHeader({ column }: any) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2.5 h-7 px-2 font-medium data-[state=on]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {label}
        <ArrowUpDown className="ml-1.5 size-3 opacity-50" />
      </Button>
    );
  };
}

export function DataTable<T>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "搜索…",
  selectable = false,
  onSelectionChange,
  defaultAllSelected = false,
  getRowId,
  pageSize = 20,
  loading = false,
  empty,
  toolbar,
  rowMuted,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [search, setSearch] = React.useState("");

  const allColumns = React.useMemo<ColumnDef<T, unknown>[]>(() => {
    if (!selectable) return columns;
    const selectColumn: ColumnDef<T, unknown> = {
      id: "__select",
      size: 36,
      header: ({ table }) => (
        <Checkbox
          aria-label="全选"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="选择此行"
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
        />
      ),
      enableSorting: false,
    };
    return [selectColumn, ...columns];
  }, [columns, selectable]);

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, rowSelection, globalFilter: search },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearch,
    globalFilterFn: searchKey
      ? (row, _columnId, filterValue) => {
          const v = row.original[searchKey];
          return String(v ?? "")
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
        }
      : "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(pageSize > 0
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: { pagination: { pageSize } },
        }
      : {}),
  });

  // 数据首次到达时默认全选
  const seeded = React.useRef(false);
  React.useEffect(() => {
    if (!selectable || !defaultAllSelected || seeded.current) return;
    if (data.length === 0) return;
    seeded.current = true;
    table.toggleAllRowsSelected(true);
  }, [data, defaultAllSelected, selectable, table]);

  // 把选中行回传给调用方
  const notify = React.useRef(onSelectionChange);
  notify.current = onSelectionChange;
  React.useEffect(() => {
    notify.current?.(
      table.getSelectedRowModel().rows.map((r) => r.original),
    );
  }, [rowSelection, table]);

  const hasHeader = Boolean(searchKey || toolbar);
  const rows = table.getRowModel().rows;
  const colCount = allColumns.length;

  return (
    <div className={cn("space-y-3", className)}>
      {hasHeader && (
        <div className="flex items-center gap-2">
          {searchKey && (
            <div className="relative max-w-xs flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 pl-8"
              />
            </div>
          )}
          {toolbar && (
            <div className="ml-auto flex items-center gap-2">{toolbar}</div>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={
                        header.column.columnDef.size
                          ? { width: header.column.columnDef.size }
                          : undefined
                      }
                      className="h-9 text-xs font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: colCount }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colCount} className="p-0">
                    <EmptyState
                      title={empty?.title ?? "暂无数据"}
                      description={empty?.description}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(rowMuted?.(row.original) && "opacity-45")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pageSize > 0 && table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {selectable
              ? `已选 ${table.getSelectedRowModel().rows.length} / ${data.length} 条`
              : `共 ${data.length} 条`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">
              第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 页
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="上一页"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="下一页"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {pageSize === 0 && selectable && rows.length > 0 && (
        <p className="text-xs text-muted-foreground tabular-nums">
          已选 {table.getSelectedRowModel().rows.length} / {data.length} 条
        </p>
      )}
    </div>
  );
}
