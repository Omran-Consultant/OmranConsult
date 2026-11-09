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
        "relative flex min-h-[11.5rem] flex-col gap-3 overflow-hidden rounded-[1.125rem] border border-line bg-elevated p-[1.125rem]",
        className,
      )}
      style={{ borderInlineStartWidth: 3, borderInlineStartColor: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.84rem] font-medium text-muted">{label}</p>
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 13%, transparent)` }}
        >
          {icon}
        </span>
      </div>
      <div className="font-display text-[2.125rem] leading-none font-semibold tracking-tight text-primary" data-kpi={dataKpi}>
        {formatDashboardNumber(value, locale)}
        {unit ? <span className="ms-2 text-[0.8125rem] font-normal text-muted">{unit}</span> : null}
      </div>
      <div className="mt-auto flex min-h-6 flex-wrap items-center justify-between gap-2 text-[0.78rem] text-muted">{footer}</div>
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
