import Link from "next/link";
import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { formatDashboardNumber } from "@/features/dashboard/format/format-dashboard-number";
import type { AppLocale } from "@/i18n/routing";

export function KpiCard({
  label,
  value,
  unit,
  locale,
  accent,
  icon,
  footer,
  href,
  className,
  dataKpi,
}: {
  label: string;
  value: number;
  unit?: string;
  locale: AppLocale;
  accent: string;
  icon: ReactNode;
  footer: ReactNode;
  href?: string;
  className?: string;
  dataKpi?: string;
}) {
  const body = (
    <article
      className={classNames(
        "relative flex min-h-[10.5rem] flex-col gap-3 overflow-hidden rounded-[1.125rem] border border-line bg-elevated p-[18px]",
        className,
      )}
      style={{ borderInlineStartWidth: 3, borderInlineStartColor: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13.5px] leading-5 font-medium text-secondary" data-kpi-label>
          {label}
        </p>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-[0.75rem]"
          style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="font-display text-[34px] leading-none font-semibold tracking-tight text-primary tabular-nums"
          data-kpi={dataKpi}
          data-kpi-value
        >
          {formatDashboardNumber(value, locale)}
        </span>
        {unit ? <span className="text-[12.5px] text-muted">{unit}</span> : null}
      </div>
      <div className="mt-auto min-h-6 text-[12.5px] leading-5 text-muted" data-kpi-context>{footer}</div>
    </article>
  );

  if (href) {
    return (
      <Link className="block transition-shadow hover:shadow-[var(--elevation-lift)]" href={href}>
        {body}
      </Link>
    );
  }

  return body;
}
