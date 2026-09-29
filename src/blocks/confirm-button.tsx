"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

export interface ConfirmButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  /** 确认后执行。返回 Promise 时按钮自动进入 loading 直到 resolve。 */
  onConfirm: () => void | Promise<void>;
  confirmTitle?: React.ReactNode;
  confirmDescription?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 危险操作用 destructive，确认按钮会变红。 */
  tone?: "default" | "destructive";
}

/**
 * 带二次确认的按钮。不可逆操作（真实提交、删除、批量执行）一律用它，
 * 不要直接给 Button 挂 onClick。
 */
export function ConfirmButton({
  onConfirm,
  confirmTitle = "确认执行？",
  confirmDescription,
  confirmLabel = "确认",
  cancelLabel = "取消",
  tone = "default",
  children,
  disabled,
  ...props
}: ConfirmButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function run() {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
      <DialogTrigger asChild>
        <Button disabled={disabled || pending} {...props}>
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
          {confirmDescription && (
            <DialogDescription className="text-pretty">
              {confirmDescription}
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={pending}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={tone === "destructive" ? "destructive" : "default"}
            onClick={run}
            disabled={pending}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
