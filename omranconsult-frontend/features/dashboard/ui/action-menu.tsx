"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/core/ui/icon";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";

export type ActionMenuItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

export function ActionMenu({ label, items }: { label: string; items: ActionMenuItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <RowActionButton label={label} onClick={() => setOpen((value) => !value)}>
        <Icon name="dots" />
      </RowActionButton>
      {open ? (
        <ul className="absolute end-0 z-20 mt-1 min-w-44 rounded-xl border border-line bg-elevated py-1 shadow-[var(--elevation-popup)]">
          {items.map((item) => (
            <li key={item.id}>
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-start text-body-s hover:bg-highlight"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                type="button"
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
