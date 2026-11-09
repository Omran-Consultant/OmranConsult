"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/core/ui/button";
import { Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { DashboardPagination } from "@/features/dashboard/ui/pagination";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { controlMdClass, controlRowClass } from "@/features/dashboard/ui/control-styles";
import { FilterBar } from "@/features/dashboard/ui/filter-bar";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import { ViewToggle } from "@/features/dashboard/ui/view-toggle";
import type { AppLocale } from "@/i18n/routing";
import { adminProjects } from "@/lib/api/admin-browser";
import type { AdminProjectListItem } from "@/lib/api/types";

type StatusFilter = "all" | "published" | "draft" | "trashed" | "published_with_draft";

function localizedName(value: { ar?: string | null; en?: string | null } | null | undefined, locale: AppLocale): string {
  if (!value) {
    return "—";
  }
  return (locale === "ar" ? value.ar : value.en) ?? value.en ?? value.ar ?? "—";
}

export default function ProjectsListPage() {
  const t = useTranslations("Dashboard.projects");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [items, setItems] = useState<AdminProjectListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [view, setView] = useState<"table" | "grid">("table");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void adminProjects(q).then((payload) => {
        setItems(payload.data);
        setTotal(payload.meta.total);
        setLoaded(true);
      });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q]);

  const counts = useMemo(() => {
    const tally = { all: items.length, published: 0, draft: 0, trashed: 0, published_with_draft: 0 };
    for (const row of items) {
      if (row.status in tally) {
        tally[row.status as keyof typeof tally] += 1;
      }
    }
    return tally;
  }, [items]);

  const filtered = useMemo(() => {
    if (status === "all") {
      return items;
    }
    return items.filter((row) => row.status === status);
  }, [items, status]);

  const columns = [
    {
      id: "project",
      header: t("colProject"),
      cell: (row: AdminProjectListItem) => (
        <Link
          className="flex min-w-0 items-center gap-3"
          data-project-id={String(row.id)}
          data-slug={row.slug}
          data-status={row.status}
          href={`/dashboard/projects/${row.id}`}
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-highlight text-muted">
            {row.cover_path ? <Icon name="image" /> : <Icon name="layers" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium">{localizedName(row.title, locale)}</span>
            <span className="text-caption text-muted">{row.slug}</span>
          </span>
        </Link>
      ),
    },
    {
      id: "sector",
      header: t("colSector"),
      cell: (row: AdminProjectListItem) => localizedName(row.sector_name ?? null, locale),
    },
    {
      id: "client",
      header: t("colClient"),
      cell: (row: AdminProjectListItem) => localizedName(row.client_name ?? null, locale),
    },
    {
      id: "regions",
      header: t("colRegions"),
      cell: (row: AdminProjectListItem) =>
        row.region_names?.map((name) => localizedName(name, locale)).join(locale === "ar" ? "، " : ", ") || "—",
    },
    {
      id: "updated",
      header: t("colUpdated"),
      cell: (row: AdminProjectListItem) => <RelativeTime locale={locale} value={row.updated_at} />,
    },
    {
      id: "status",
      header: t("colStatus"),
      cell: (row: AdminProjectListItem) => <StatusPill locale={locale} status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6" data-ready="true" data-dashboard-toolbar>
      <PageHeader
        actions={
          <Button disabled title={t("addDisabled")} type="button">
            <Icon name="plus" />
            {t("add")}
          </Button>
        }
        title={t("title")}
      />
      <DashboardTabs
        active={status}
        onChange={(id) => setStatus(id as StatusFilter)}
        tabs={[
          { id: "all", label: t("tabAll"), count: total || counts.all },
          { id: "published", label: t("status.published"), count: counts.published },
          { id: "draft", label: t("status.draft"), count: counts.draft },
          { id: "trashed", label: t("status.trashed"), count: counts.trashed },
        ]}
      />
      <FilterBar className={controlRowClass}>
        <input
          className={`${controlMdClass} min-w-[12rem] flex-1`}
          onChange={(event) => setQ(event.target.value)}
          placeholder={t("search")}
          type="search"
          value={q}
        />
        <ViewToggle
          gridLabel={t("viewGrid")}
          onChange={setView}
          tableLabel={t("viewTable")}
          value={view}
        />
      </FilterBar>
      {view === "table" ? (
        <DataTable
          columns={columns}
          emptyTitle={t("empty")}
          loading={!loaded}
          mobileCard={(row) => (
            <article className="rounded-2xl border border-line bg-elevated p-4" key={row.id}>
              {columns[0].cell(row)}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <StatusPill locale={locale} status={row.status} />
                <RelativeTime locale={locale} value={row.updated_at} />
              </div>
            </article>
          )}
          rowActions={(row) => (
            <>
              <Link
                className={controlMdClass}
                href={`/dashboard/projects/${row.id}?preview=1`}
                title={t("preview")}
              >
                <Icon name="eye" />
                <span className="sr-only">{t("preview")}</span>
              </Link>
              <Link className={controlMdClass} href={`/dashboard/projects/${row.id}`} title={t("edit")}>
                <Icon name="edit" />
                <span className="sr-only">{t("edit")}</span>
              </Link>
              <RowActionButton disabled label={t("deleteDisabled")}>
                <Icon name="trash" />
              </RowActionButton>
            </>
          )}
          rows={filtered.map((row) => ({ ...row, id: row.id }))}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <Link
              className="rounded-2xl border border-line bg-elevated p-4 transition-shadow hover:shadow-[var(--elevation-lift)]"
              data-project-id={String(row.id)}
              data-slug={row.slug}
              data-status={row.status}
              href={`/dashboard/projects/${row.id}`}
              key={row.id}
            >
              <div className="mb-3 grid aspect-video place-items-center rounded-xl bg-highlight text-muted">
                <Icon name="image" />
              </div>
              <p className="font-medium">{localizedName(row.title, locale)}</p>
              <p className="text-caption text-muted">{row.slug}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusPill locale={locale} status={row.status} />
                <RelativeTime locale={locale} value={row.updated_at} />
              </div>
            </Link>
          ))}
        </div>
      )}
      <DashboardPagination
        from={filtered.length === 0 ? 0 : 1}
        hasNext={false}
        hasPrev={false}
        locale={locale}
        onNext={() => undefined}
        onPrev={() => undefined}
        to={filtered.length}
        total={total || filtered.length}
      />
    </div>
  );
}
