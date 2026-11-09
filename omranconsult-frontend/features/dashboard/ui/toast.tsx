"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type ToastItem = { id: number; message: string };

const ToastContext = createContext<{
  push: (message: string) => void;
} | null>(null);

export function DashboardToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string) => {
    const id = Date.now();
    setItems((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4">
        {items.map((item) => (
          <p
            className={classNames(
              "pointer-events-auto rounded-full border border-line bg-elevated px-4 py-2 text-body-s shadow-[var(--elevation-popup)]",
            )}
            key={item.id}
            role="status"
          >
            {item.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useDashboardToast(): (message: string) => void {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useDashboardToast requires DashboardToastProvider");
  }

  return ctx.push;
}
