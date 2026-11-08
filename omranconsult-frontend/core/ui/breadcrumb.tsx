import { Fragment } from "react";

import { Link } from "@/i18n/navigation";

export type BreadcrumbItem = {
  readonly label: string;
  /** Omit for the current page. */
  readonly href?: string;
};

type BreadcrumbProps = {
  readonly items: readonly BreadcrumbItem[];
  readonly label: string;
};

/** Hero breadcrumb: caption, muted ancestors, accent current page, "/" separators. */
export function Breadcrumb({ items, label }: BreadcrumbProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-2.5 text-caption">
        {items.map((item, index) => (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <li aria-hidden="true" className="text-muted">
                /
              </li>
            ) : null}
            <li className="min-w-0">
              {item.href ? (
                <Link className="text-muted transition-colors duration-150 hover:text-primary" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="line-clamp-1 text-accent">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
