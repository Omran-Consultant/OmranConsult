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
    <header className={classNames("flex flex-col gap-2", className)}>
      {breadcrumbs ? <div className="text-caption text-muted">{breadcrumbs}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-h3 text-primary">{title}</h1>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {subtitle ? <p className="text-body-s text-secondary">{subtitle}</p> : null}
    </header>
  );
}
