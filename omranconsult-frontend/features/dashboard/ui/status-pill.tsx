import { classNames } from "@/core/ui/class-names";
import { labelContentStatus } from "@/features/dashboard/labels";
import type { AppLocale } from "@/i18n/routing";

const TONE: Record<string, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-muted/15 text-secondary",
  published_with_draft: "bg-accent/10 text-accent",
  trashed: "bg-danger/10 text-danger",
  new: "bg-accent/10 text-accent",
  pending: "bg-warning/10 text-warning",
};

export function StatusPill({ status, locale }: { status: string; locale: AppLocale }) {
  const label = labelContentStatus(status, locale);
  const tone = TONE[status] ?? "bg-highlight text-secondary";

  return (
    <span
      className={classNames(
        "inline-flex h-[1.625rem] max-w-full items-center gap-1.5 rounded-full px-2.5 text-caption font-medium",
        tone,
      )}
    >
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
      {label}
    </span>
  );
}
