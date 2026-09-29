/**
 * @pallet/ui — 全部导出集中在这里。
 *
 * 使用时永远只写一行：
 *   import { PageShell, Section, DataTable, Button } from "@pallet/ui";
 *
 * 不要从 "@pallet/ui/src/components/ui/button" 这类深层路径导入。
 */

// —— 工具 ——
export { cn } from "./lib/utils";

// —— 高层 block（优先用这些，能省掉 90% 的样板代码）——
export { PalletProvider } from "./blocks/providers";
export { ThemeToggle } from "./blocks/theme-toggle";
export { PageShell } from "./blocks/page-shell";
export type { PageShellProps, NavItem, NavGroup } from "./blocks/page-shell";
export { PageHeader } from "./blocks/page-header";
export type { PageHeaderProps } from "./blocks/page-header";
export { Section } from "./blocks/section";
export type { SectionProps } from "./blocks/section";
export { StatCard } from "./blocks/stat-card";
export type { StatCardProps } from "./blocks/stat-card";
export { StatusBadge } from "./blocks/status-badge";
export type { StatusBadgeProps, StatusTone } from "./blocks/status-badge";
export { EmptyState } from "./blocks/empty-state";
export type { EmptyStateProps } from "./blocks/empty-state";
export { DataTable, sortableHeader } from "./blocks/data-table";
export type { DataTableProps } from "./blocks/data-table";
export { LogStream, inferLevel } from "./blocks/log-stream";
export { Chat, ChatBubble, ChatToolList, ChatAskOptions } from "./blocks/chat";
export type { ChatProps } from "./blocks/chat";
export { useChatStream, streamChat } from "./blocks/chat-stream";
export { useChatViewportShell } from "./blocks/chat-shell";
export type {
  ChatMessage,
  ChatToolCall,
  ChatAskUser,
  StreamChatOptions,
  UseChatStreamOptions,
} from "./blocks/chat-stream";
export type { LogStreamProps, LogLine, LogLevel } from "./blocks/log-stream";
export { UploadDrop } from "./blocks/upload-drop";
export type { UploadDropProps } from "./blocks/upload-drop";
export { ConfirmButton } from "./blocks/confirm-button";
export type { ConfirmButtonProps } from "./blocks/confirm-button";
export { Field } from "./blocks/field";
export type { FieldProps } from "./blocks/field";

// —— 底层组件（block 不够用时才直接用）——
export * from "./components/ui/alert";
export * from "./components/ui/avatar";
export * from "./components/ui/badge";
export * from "./components/ui/breadcrumb";
export * from "./components/ui/button";
export * from "./components/ui/card";
export * from "./components/ui/chart";
export * from "./components/ui/checkbox";
export * from "./components/ui/command";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/input";
export * from "./components/ui/label";
export * from "./components/ui/popover";
export * from "./components/ui/progress";
export * from "./components/ui/scroll-area";
export * from "./components/ui/select";
export * from "./components/ui/separator";
export * from "./components/ui/sheet";
export * from "./components/ui/sidebar";
export * from "./components/ui/skeleton";
export * from "./components/ui/sonner";
export * from "./components/ui/table";
export * from "./components/ui/tabs";
export * from "./components/ui/tooltip";

export { useIsMobile } from "./hooks/use-mobile";

// —— 常用第三方（避免各 app 重复装依赖、版本漂移）——
export { toast } from "sonner";
export { useTheme } from "next-themes";
export type { ColumnDef } from "@tanstack/react-table";
