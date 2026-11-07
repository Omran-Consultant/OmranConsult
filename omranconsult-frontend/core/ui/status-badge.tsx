import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_CLASS: Record<StatusTone, { readonly badge: string; readonly dot: string }> = {
  success: { badge: "bg-success/14 text-success", dot: "bg-success" },
  warning: { badge: "bg-warning/14 text-warning", dot: "bg-warning" },
  danger: { badge: "bg-danger/14 text-danger-label", dot: "bg-danger" },
  info: { badge: "bg-info/14 text-info", dot: "bg-info" },
  neutral: { badge: "bg-muted/14 text-muted", dot: "bg-muted" },
};

type StatusBadgeProps = {
  readonly tone: StatusTone;
  /** The text carries the meaning; colour is never the only signal. */
  readonly children: ReactNode;
  readonly className?: string;
};

/** Figma "Status Badge": padding 5/12, 6 px dot, status colour at 14 %. */
export function StatusBadge({ tone, children, className }: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full px-3 py-[5px] text-caption",
        TONE_CLASS[tone].badge,
        className,
      )}
    >
      <span aria-hidden="true" className={classNames("size-1.5 rounded-full", TONE_CLASS[tone].dot)} />
      {children}
    </span>
  );
}
