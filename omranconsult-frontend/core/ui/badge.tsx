import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type BadgeTone = "neutral" | "success";

type BadgeProps = {
  readonly children: ReactNode;
  readonly tone?: BadgeTone;
  readonly className?: string;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-muted",
  success: "bg-brand-green-light/20 text-brand-green-strong",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClassName[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
