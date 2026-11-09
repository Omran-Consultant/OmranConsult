import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={classNames("flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-2">
        {breadcrumbs ? <div className="text-caption text-muted">{breadcrumbs}</div> : null}
        <h1 className="font-display text-h3 text-primary">{title}</h1>
        {subtitle ? <p className="text-body-s text-secondary">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
