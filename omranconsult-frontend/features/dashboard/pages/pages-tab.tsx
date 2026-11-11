"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { Skeleton } from "@/core/ui/skeleton";
import { PAGE_PATHS, pageLabel, sectionHint, sectionLabel } from "@/features/dashboard/pages/field-labels";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import { adminPages } from "@/lib/api/admin-browser";
import type { AdminPagesIndex } from "@/lib/api/types";

/** One accordion row per public page; expands to its editable sections. */
export function PagesTab({ locale }: { readonly locale: AppLocale }) {
  const t = useTranslations("Dashboard.pages");
  const router = useRouter();
  const [pages, setPages] = useState<AdminPagesIndex["data"] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openPage, setOpenPage] = useState<string | null>("home");

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
      <div className="space-y-3" data-ready="false">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <ul className="min-w-0 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-elevated" data-ready="true">
      {pages.map((page) => {
        const open = openPage === page.page;
        const pageStatus = page.blocks.every((block) => block.status === "published")
          ? "published"
          : page.blocks.some((block) => block.status === "draft")
            ? "draft"
            : "published_with_draft";
        return (
          <li data-page-card={page.page} key={page.page}>
            <div className="flex min-h-11 items-center gap-3 px-4 md:min-h-12">
              <button
                aria-expanded={open}
                className="flex min-w-0 flex-1 items-center gap-3 text-start"
                onClick={() => setOpenPage(open ? null : page.page)}
                type="button"
              >
                <Icon className={`size-4 shrink-0 text-muted transition-transform ${open ? "-rotate-90" : ""}`} name="chevron-left" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-s font-medium text-primary">{pageLabel(page.page, locale)}</span>
                  <span className="block text-caption text-muted">{t("sectionsCount", { count: page.blocks.length })}</span>
                </span>
              </button>
              <StatusPill locale={locale} status={pageStatus} />
              <a
                className="inline-flex h-11 shrink-0 items-center px-2 text-label-s text-accent hover:underline md:h-12"
                href={`/${locale}${PAGE_PATHS[page.page] ?? ""}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("viewPage")}
              </a>
            </div>
            {open ? (
              <div className="border-t border-line bg-highlight/30 px-4 py-1">
                {page.blocks.length === 0 ? (
                  <p className="py-3 text-body-s text-muted">{t("empty")}</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {page.blocks.map((block) => {
                      const hint = sectionHint(page.page, block.section_key, locale);
                      return (
                        <li className="flex min-h-11 items-center gap-3 md:min-h-12" key={block.id}>
                          <button
                            className="min-w-0 flex-1 py-2 text-start"
                            data-block-link={block.section_key}
                            onClick={() => router.push(`/dashboard/pages/blocks/${block.id}`)}
                            type="button"
                          >
                            <span className="block truncate text-body-s font-medium text-primary">
                              {sectionLabel(block.section_key, locale, page.page)}
                            </span>
                            {hint ? <span className="block truncate text-caption text-muted">{hint}</span> : null}
                            <RelativeTime className="text-caption text-muted" locale={locale} value={block.updated_at} />
                          </button>
                          <StatusPill locale={locale} status={block.status} />
                          <RowActionButton label={t("edit")} onClick={() => router.push(`/dashboard/pages/blocks/${block.id}`)}>
                            <Icon name="edit" />
                          </RowActionButton>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
