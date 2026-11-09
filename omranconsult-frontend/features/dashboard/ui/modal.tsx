"use client";

import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 p-4">
      <button aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose} type="button" />
      <div
        className={classNames(
          "relative z-10 w-full max-w-lg rounded-2xl border border-line bg-elevated shadow-[var(--elevation-popup)]",
        )}
        role="dialog"
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-h5">{title}</h2>
          <button className="rounded-full p-2 hover:bg-highlight" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </header>
        <div className="px-5 py-4">{children}</div>
        {footer ? <footer className="border-t border-line px-5 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
}
