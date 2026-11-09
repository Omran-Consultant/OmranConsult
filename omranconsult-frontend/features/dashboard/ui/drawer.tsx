"use client";

import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-scrim/50">
      <button aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <aside
        className={classNames(
          "relative z-10 flex h-full w-full max-w-md flex-col border-s border-line bg-elevated shadow-[var(--elevation-popup)]",
          "animate-in slide-in-from-end duration-200",
        )}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-h5">{title}</h2>
          <button className="rounded-full p-2 hover:bg-highlight" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </aside>
    </div>
  );
}
