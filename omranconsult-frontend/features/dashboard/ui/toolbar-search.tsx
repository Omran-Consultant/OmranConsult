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
      className={`${controlMdClass} w-full min-w-0 max-w-[22.5rem] justify-start overflow-hidden px-2.5 text-muted sm:px-3 ${className ?? ""}`}
      data-dashboard-search
      onClick={onActivate}
      type="button"
    >
      <Icon className="shrink-0" name="search" />
      <span className="min-w-0 truncate">{label}</span>
      {hint ? <kbd className="ms-auto hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-caption sm:inline">{hint}</kbd> : null}
    </button>
  );
}
