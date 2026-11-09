import { classNames } from "@/core/ui/class-names";
import { labelRole } from "@/features/dashboard/labels";
import type { AppLocale } from "@/i18n/routing";

const COLORS: Record<string, string> = {
  super_admin: "text-primary bg-success/15",
  editor: "text-primary bg-accent/15",
};

export function RoleBadge({ role, locale }: { role: string; locale: AppLocale }) {
  return (
    <span
      className={classNames(
        "inline-flex h-[1.625rem] items-center rounded-full px-2.5 text-caption font-medium",
        COLORS[role] ?? "bg-highlight text-secondary",
      )}
    >
      {labelRole(role, locale)}
    </span>
  );
}
