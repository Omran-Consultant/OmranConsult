"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { Skeleton } from "@/core/ui/skeleton";
import { PAGE_PATHS, pageLabel, sectionLabel } from "@/features/dashboard/pages/field-labels";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import { adminPages } from "@/lib/api/admin-browser";
import type { AdminPagesIndex } from "@/lib/api/types";

/** One card per public page, listing its editable sections. */
export function PagesTab({ locale }: { readonly locale: AppLocale }) {
  const t = useTranslations("Dashboard.pages");
  const router = useRouter();
  const [pages, setPages] = useState<AdminPagesIndex["data"] | null>(null);
  const [failed, setFailed] = useState(false);

  function load() {
    void adminPages()
      .then((response) => setPages(response.data))
      .catch(() => setFailed(true));
  }

  useEffect(load, []);

  function retry() {
    setFailed(false);
    load();
  }

  if (failed) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-body-s text-danger" data-ready="true">
        <p>{t("loadError")}</p>
        <button className="mt-3 text-label-s text-accent underline" onClick={retry} type="button">
          {t("retry")}
        </button>
      </div>
    );
  }
  if (!pages) {
    return (
      <div className="grid gap-4 xl:grid-cols-2" data-ready="false">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2" data-ready="true">
      {pages.map((page) => (
        <article className="min-w-0 rounded-2xl border border-line bg-elevated p-5" data-page-card={page.page} key={page.page}>
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-h5">{pageLabel(page.page, locale)}</h2>
              <p className="text-caption text-muted">{t("sectionsCount", { count: page.blocks.length })}</p>
            </div>
            <a
              className="text-body-s text-accent hover:underline"
              href={`/${locale}${PAGE_PATHS[page.page] ?? ""}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("viewPage")}
            </a>
          </header>
          {page.blocks.length === 0 ? (
            <p className="mt-4 text-body-s text-muted">{t("empty")}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {page.blocks.map((block) => (
                <li className="flex min-w-0 items-center gap-3 py-2" key={block.id}>
                  <button
                    className="min-w-0 flex-1 text-start"
                    data-block-link={block.section_key}
                    onClick={() => router.push(`/dashboard/pages/blocks/${block.id}`)}
                    type="button"
                  >
                    <span className="block truncate text-body-s font-medium text-primary">{sectionLabel(block.section_key, locale)}</span>
                    <RelativeTime className="text-caption text-muted" locale={locale} value={block.updated_at} />
                  </button>
                  <StatusPill locale={locale} status={block.status} />
                  <RowActionButton label={t("edit")} onClick={() => router.push(`/dashboard/pages/blocks/${block.id}`)}>
                    <Icon name="edit" />
                  </RowActionButton>
                </li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
