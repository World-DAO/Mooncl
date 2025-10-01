"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type Toast = {
  id: number;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number; // ms
};

type ToastContextValue = {
  show: (t: Omit<Toast, "id">) => number;
  hide: (id: number) => void;
  success: (message: string, title?: string) => number;
  error: (message: string, title?: string) => number;
  info: (message: string, title?: string) => number;
  warning: (message: string, title?: string) => number;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function VariantBar({ variant = "default" }: { variant?: ToastVariant }) {
  const color =
    variant === "success"
      ? "bg-emerald-400/90"
      : variant === "error"
      ? "bg-red-500/90"
      : variant === "warning"
      ? "bg-amber-400/90"
      : variant === "info"
      ? "bg-sky-400/90"
      : "bg-white/40";
  return <span className={`inline-block w-1 h-8 rounded-full ${color}`} />;
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: number) => void }) {
  return (
    <div
      className="
        pointer-events-auto
        inline-flex items-center gap-3
        rounded-full
        bg-white/10 border border-white/20
        backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,.28)]
        text-white px-4 py-2
        animate-[fadeIn_.15s_ease-out]
      "
      role="status"
      aria-live="polite"
    >
      <VariantBar variant={toast.variant} />
      <div className="flex items-center gap-2">
        {toast.title ? (
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">{toast.title}</span>
            <span className="text-sm opacity-85 leading-tight">{toast.message}</span>
          </div>
        ) : (
          <span className="text-sm opacity-90 leading-tight">{toast.message}</span>
        )}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-1 inline-grid place-items-center w-6 h-6 rounded-full hover:bg-white/10 active:bg-white/15"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

let idCounter = 1;

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hide = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    ({ message, title, variant = "default", duration = 4200 }: Omit<Toast, "id">) => {
      const id = idCounter++;
      const t: Toast = { id, message, title, variant, duration };
      setToasts((prev) => [...prev, t]);

      if (duration && duration > 0) {
        window.setTimeout(() => hide(id), duration);
      }

      return id;
    },
    [hide]
  );

  const success = useCallback((message: string, title?: string) => show({ message, title, variant: "success" }), [show]);
  const error = useCallback((message: string, title?: string) => show({ message, title, variant: "error" }), [show]);
  const info = useCallback((message: string, title?: string) => show({ message, title, variant: "info" }), [show]);
  const warning = useCallback((message: string, title?: string) => show({ message, title, variant: "warning" }), [show]);

  const value = useMemo(() => ({ show, hide, success, error, info, warning }), [error, hide, info, show, success, warning]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Top-left, top-most layer above modals */}
      <div className="pointer-events-none fixed top-6 left-6 z-[1000]">
        <div className="flex flex-col gap-2 items-start">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={hide} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
