"use client";

import { Icon } from "@/core/ui/icon";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";

export function ToolbarSearch({
  label,
  hint,
  onActivate,
  className,
}: {
  label: string;
  hint?: string;
  onActivate: () => void;
  className?: string;
}) {
  return (
    <button
      className={`${controlMdClass} w-full max-w-[22.5rem] justify-start text-muted ${className ?? ""}`}
      data-dashboard-search
      onClick={onActivate}
      type="button"
    >
      <Icon name="search" />
      <span className="truncate">{label}</span>
      {hint ? <kbd className="ms-auto rounded border border-line px-1.5 py-0.5 text-caption">{hint}</kbd> : null}
    </button>
  );
}
