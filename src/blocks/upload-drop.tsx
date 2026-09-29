"use client";

import * as React from "react";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export interface UploadDropProps
  extends Omit<React.ComponentProps<"div">, "onDrop"> {
  /** 选中或拖入文件时触发。 */
  onFile: (file: File) => void;
  /** 传给 <input accept>，例如 ".xlsx,.xlsm"。 */
  accept?: string;
  /** 允许一次多个文件时用 onFiles 取全部。 */
  multiple?: boolean;
  onFiles?: (files: File[]) => void;
  /** 解析/上传中——禁用交互并显示转圈。 */
  busy?: boolean;
  busyLabel?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  disabled?: boolean;
}

/**
 * 文件拖拽上传区。点击和拖入都支持，带 hover / busy 态。
 * 不要自己写 dragover 那一套。
 */
export function UploadDrop({
  onFile,
  onFiles,
  accept,
  multiple = false,
  busy = false,
  busyLabel = "处理中…",
  label = "点击选择文件，或直接拖到这里",
  hint,
  disabled = false,
  className,
  ...props
}: UploadDropProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [hover, setHover] = React.useState(false);
  const locked = disabled || busy;

  const handle = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const files = Array.from(list);
    onFiles?.(files);
    onFile(files[0]);
  };

  return (
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      onClick={() => !locked && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (locked) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        if (locked) return;
        e.preventDefault();
        setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        if (locked) return;
        e.preventDefault();
        setHover(false);
        handle(e.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg px-6 py-10 text-center",
        "border-2 border-dashed transition-colors outline-none",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        locked
          ? "cursor-not-allowed border-border opacity-60"
          : "cursor-pointer border-border hover:border-primary/50 hover:bg-accent/40",
        hover && !locked && "border-primary bg-accent",
        className,
      )}
      {...props}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileUp className="size-4" />
        )}
      </div>
      <p className="text-sm font-medium">{busy ? busyLabel : label}</p>
      {hint && !busy && (
        <p className="text-xs text-muted-foreground text-pretty">{hint}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
