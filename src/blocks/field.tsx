import * as React from "react";
import { cn } from "../lib/utils";
import { Label } from "../components/ui/label";

export interface FieldProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  /** 传给 <Label htmlFor>，需与输入控件的 id 一致。 */
  htmlFor?: string;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
}

/**
 * 表单字段包装：标签 + 控件 + 提示 + 错误，间距统一。
 * children 放实际的 Input / Select / Textarea。
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <Label htmlFor={htmlFor} className="gap-1">
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground text-pretty">{hint}</p>
      ) : null}
    </div>
  );
}
