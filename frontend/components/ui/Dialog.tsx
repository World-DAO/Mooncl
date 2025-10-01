// components/ui/Dialog.tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Size = "md" | "lg" | "xl" | "full";
type Border = "none" | "gradient";

export interface DialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  size?: Size;
  border?: Border;
  children?: React.ReactNode;
  className?: string;
}

export default function Dialog({
  open,
  onOpenChange,
  title,
  footer,
  size = "lg",
  border = "none",
  children,
  className,
}: DialogProps) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange?.(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!mounted || !open) return null;

  const sizes: Record<Size, string> = {
    md: "max-w-[560px]",
    lg: "max-w-[820px]",
    xl: "max-w-[980px]",
    full: "max-w-[1100px] w-[92vw] md:w-[86vw] h-[80vh]",
  };

  const panel = (
    <div className="fixed inset-0 z-[60]">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
      />
      {/* 弹窗面板 */}
      <div
        className={cn("absolute inset-0 flex items-center justify-center p-4")}
      >
        <div
          className={cn(
            "relative w-full rounded-3xl border flex h-full flex-col",
            "bg-[rgba(16,24,39,0.35)] border-white/20",
            "backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.35)]",
            sizes[size],
            className
          )}
        >
          {/* 渐变描边（可选） */}
          {border === "gradient" && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{
                padding: 1,
                background: "var(--gradient-brand)",
                WebkitMask:
                  "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
          )}

          {/* 标题栏 */}
          {title && (
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="text-xl font-semibold text-white">{title}</div>
              <button
                className="h-8 w-8 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition"
                onClick={() => onOpenChange?.(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* 内容 */}
          <div className="flex-1 overflow-y-auto px-6 py-2">{children}</div>
          {/* 底部 */}
          {footer && <div className="px-6 pb-6">{footer}</div>}
        </div>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
}
