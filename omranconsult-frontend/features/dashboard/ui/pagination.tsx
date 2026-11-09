import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";
import { formatDashboardNumber } from "@/features/dashboard/format/format-dashboard-number";
import type { AppLocale } from "@/i18n/routing";

export function DashboardPagination({
  from,
  to,
  total,
  locale,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  className,
}: {
  from: number;
  to: number;
  total: number;
  locale: AppLocale;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  className?: string;
}) {
  const label =
    locale === "ar"
      ? `عرض ${formatDashboardNumber(from, locale)}–${formatDashboardNumber(to, locale)} من ${formatDashboardNumber(total, locale)}`
      : `Showing ${formatDashboardNumber(from, locale)}–${formatDashboardNumber(to, locale)} of ${formatDashboardNumber(total, locale)}`;

  return (
    <div className={classNames("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="text-body-s text-muted">{label}</p>
      <div className="flex gap-2">
        <button className={controlMdClass} disabled={!hasPrev} onClick={onPrev} type="button">
          <Icon name="chevron-left" />
          <span className="sr-only">{locale === "ar" ? "السابق" : "Previous"}</span>
        </button>
        <button className={controlMdClass} disabled={!hasNext} onClick={onNext} type="button">
          <Icon name="chevron-right" />
          <span className="sr-only">{locale === "ar" ? "التالي" : "Next"}</span>
        </button>
      </div>
    </div>
  );
}
