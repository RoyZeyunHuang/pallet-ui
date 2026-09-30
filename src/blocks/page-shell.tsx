"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import { ThemeToggle } from "./theme-toggle";

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  /** 右侧小徽标，例如待处理数量。 */
  badge?: React.ReactNode;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export interface PageShellProps {
  /** 应用名，显示在侧栏顶部。 */
  app: string;
  /** 应用图标。 */
  appIcon?: LucideIcon;
  /** 侧栏导航。传数组即可；需要分组时传 NavGroup[]。 */
  nav?: NavItem[] | NavGroup[];
  /** 当前路径，用于高亮。Next.js 里传 usePathname() 的结果。 */
  activePath?: string;
  /** 顶栏右侧操作区。主题切换按钮已自动包含，不用重复传。 */
  actions?: React.ReactNode;
  /** 顶栏左侧的标题/面包屑。留空则显示应用名。 */
  topbar?: React.ReactNode;
  /** 侧栏底部区域，通常放当前用户信息。 */
  sidebarFooter?: React.ReactNode;
  /**
   * 导航项渲染成什么组件。Next.js 里传 next/link 的 Link 以启用客户端路由；
   * 不传则用普通 <a>（整页跳转，页面少时无所谓）。
   */
  linkAs?: React.ElementType;
  /** 内容区最大宽度。表格/看板类页面用 "full"。 */
  width?: "default" | "wide" | "full";
  children: React.ReactNode;
}

const WIDTHS = {
  default: "max-w-4xl",
  wide: "max-w-7xl",
  full: "max-w-none",
} as const;

function isGrouped(nav: NavItem[] | NavGroup[]): nav is NavGroup[] {
  return nav.length > 0 && "items" in nav[0];
}

/**
 * 应用外壳：可折叠侧栏 + 顶栏 + 内容区。
 * 每个 app 的 layout 用它包一层，所有工具的骨架就完全一致。
 */
export function PageShell({
  app,
  appIcon: AppIcon,
  nav = [],
  activePath,
  actions,
  topbar,
  sidebarFooter,
  linkAs: Link = "a",
  width = "wide",
  children,
}: PageShellProps) {
  const groups: NavGroup[] = React.useMemo(
    () => (isGrouped(nav) ? nav : [{ items: nav as NavItem[] }]),
    [nav],
  );

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* 折叠后侧栏只有 3rem 宽：图标用 size-8、左右留默认 p-2，和下面的导航按钮同宽、同一条中线。
            外层不要 overflow-hidden、也不要加大左右内边距，否则折叠时图标右边会被切掉；
            展开 / 折叠过渡时文字靠自身 truncate 和折叠隐藏收住。 */}
        <SidebarHeader className="h-14 justify-center border-b">
          <div className="flex min-w-0 items-center gap-2">
            {AppIcon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <AppIcon className="size-4" />
              </span>
            )}
            <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
              {app}
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {groups.map((group, gi) => (
            <SidebarGroup key={group.label ?? gi}>
              {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={activePath === item.href}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          {item.icon && <item.icon />}
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge !== undefined && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {sidebarFooter && (
          <SidebarFooter className="border-t">{sidebarFooter}</SidebarFooter>
        )}
        <SidebarRail />
      </Sidebar>

      {/* 不要在这里加 overflow-x-hidden：它会创建滚动容器，导致下面的
          sticky 顶栏失效。用 min-w-0 约束宽度即可。 */}
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 !h-4" />
          <div className="min-w-0 flex-1 truncate text-sm font-medium">
            {topbar ?? app}
          </div>
          <div className="flex items-center gap-1">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className={cn("mx-auto w-full space-y-6", WIDTHS[width])}>
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
