"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { dashboardCoverSrc } from "@/features/dashboard/projects/cover-image";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
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

function CoverThumb({ coverPath }: { coverPath?: string | null }) {
  const src = dashboardCoverSrc(coverPath);
  if (src) {
    return <Image alt="" className="size-11 shrink-0 rounded-lg object-cover" height={44} src={src} width={44} />;
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-highlight text-muted">
      <Icon name="image" />
    </span>
  );
}

export default function ProjectsListPage() {
  const t = useTranslations("Dashboard.projects");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const router = useRouter();
  const [items, setItems] = useState<AdminProjectListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sector, setSector] = useState("");
  const [region, setRegion] = useState("");
  const [year, setYear] = useState("");
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

  const sectors = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of items) {
      const name = localizedName(row.sector_name ?? null, locale);
      if (name !== "—") {
        map.set(name, name);
      }
    }
    return [...map.values()];
  }, [items, locale]);

  const regions = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of items) {
      for (const name of row.region_names ?? []) {
        const label = localizedName(name, locale);
        if (label !== "—") {
          map.set(label, label);
        }
      }
    }
    return [...map.values()];
  }, [items, locale]);

  const years = useMemo(() => {
    const values = [...new Set(items.map((row) => row.year).filter((value): value is number => typeof value === "number"))];
    return values.sort((a, b) => b - a);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((row) => {
      if (status !== "all" && row.status !== status) {
        return false;
      }
      if (sector && localizedName(row.sector_name ?? null, locale) !== sector) {
        return false;
      }
      if (region && !(row.region_names ?? []).some((name) => localizedName(name, locale) === region)) {
        return false;
      }
      if (year && String(row.year ?? "") !== year) {
        return false;
      }
      return true;
    });
  }, [items, status, sector, region, year, locale]);

  const hasRegions = useMemo(
    () => items.some((row) => (row.region_names ?? []).length > 0),
    [items],
  );

  const columns = [
    {
      id: "project",
      header: t("colProject"),
      minWidth: "380px",
      cell: (row: AdminProjectListItem) => (
        <Link
          className="flex min-w-0 items-center gap-3"
          data-project-id={String(row.id)}
          data-slug={row.slug}
          data-status={row.status}
          href={`/dashboard/projects/${row.id}`}
        >
          <CoverThumb coverPath={row.cover_path} />
          <span className="min-w-0">
            <span className="line-clamp-2 block leading-5 font-medium">{localizedName(row.title, locale)}</span>
            <span className="block truncate text-caption leading-4 text-muted">{row.slug}</span>
          </span>
        </Link>
      ),
    },
    {
      id: "sector",
      header: t("colSector"),
      width: "140px",
      cell: (row: AdminProjectListItem) => (
        <span className="line-clamp-2">{localizedName(row.sector_name ?? null, locale)}</span>
      ),
    },
    {
      id: "client",
      header: t("colClient"),
      width: "200px",
      cell: (row: AdminProjectListItem) => {
        const name = localizedName(row.client_name ?? null, locale);
        return (
          <span className="line-clamp-2" title={name}>
            {name}
          </span>
        );
      },
    },
    ...(hasRegions
      ? [
          {
            id: "regions",
            header: t("colRegions"),
            width: "140px",
            cell: (row: AdminProjectListItem) => (
              <span className="line-clamp-2">
                {row.region_names?.map((name) => localizedName(name, locale)).join(locale === "ar" ? "، " : ", ") || "—"}
              </span>
            ),
          },
        ]
      : []),
    {
      id: "updated",
      header: t("colUpdated"),
      width: "120px",
      className: "whitespace-nowrap",
      cell: (row: AdminProjectListItem) => <RelativeTime locale={locale} value={row.updated_at} />,
    },
    {
      id: "status",
      header: t("colStatus"),
      width: "152px",
      cell: (row: AdminProjectListItem) => <StatusPill locale={locale} status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6" data-ready="true" data-dashboard-toolbar>
      <PageHeader
        actions={
          <DashboardButton disabled disabledReason={t("addDisabled")} icon={<Icon name="plus" />} type="button">
            {t("add")}
          </DashboardButton>
        }
        subtitle={t("subtitle")}
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
          aria-label={t("search")}
          className={`${controlMdClass} w-[22.5rem] max-w-full`}
          onChange={(event) => setQ(event.target.value)}
          placeholder={t("search")}
          type="search"
          value={q}
        />
        <select aria-label={t("filterSector")} className={`${controlMdClass} w-40`} onChange={(event) => setSector(event.target.value)} value={sector}>
          <option value="">{t("filterSector")}: {t("filterAll")}</option>
          {sectors.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select aria-label={t("filterRegion")} className={`${controlMdClass} w-40`} onChange={(event) => setRegion(event.target.value)} value={region}>
          <option value="">{t("filterRegion")}: {t("filterAll")}</option>
          {regions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        {years.length > 0 ? (
          <select aria-label={t("filterYear")} className={`${controlMdClass} w-32`} onChange={(event) => setYear(event.target.value)} value={year}>
            <option value="">{t("filterYear")}: {t("filterAll")}</option>
            {years.map((value) => (
              <option key={value} value={String(value)}>
                {value}
              </option>
            ))}
          </select>
        ) : null}
        <ViewToggle
          gridLabel={t("viewGrid")}
          onChange={setView}
          tableLabel={t("viewTable")}
          value={view}
        />
      </FilterBar>
      {view === "table" ? (
        <DataTable
          actionsWidth="8.25rem"
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
          onRowClick={(row) => router.push(`/dashboard/projects/${row.id}`)}
          rowActions={(row) => (
            <>
              <RowActionButton label={t("preview")} onClick={() => router.push(`/dashboard/projects/${row.id}?preview=1`)}>
                <Icon name="eye" />
              </RowActionButton>
              <RowActionButton label={t("edit")} onClick={() => router.push(`/dashboard/projects/${row.id}`)}>
                <Icon name="edit" />
              </RowActionButton>
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
              className="rounded-2xl border border-line bg-elevated p-4 text-start transition-shadow hover:shadow-[var(--elevation-lift)]"
              data-project-id={String(row.id)}
              data-slug={row.slug}
              data-status={row.status}
              href={`/dashboard/projects/${row.id}`}
              key={row.id}
            >
              <div className="mb-3 overflow-hidden rounded-xl bg-highlight">
                {dashboardCoverSrc(row.cover_path) ? (
                  <Image alt="" className="aspect-video w-full object-cover" height={180} src={dashboardCoverSrc(row.cover_path) ?? ""} width={320} />
                ) : (
                  <div className="grid aspect-video place-items-center text-muted">
                    <Icon name="image" />
                  </div>
                )}
              </div>
              <p className="line-clamp-2 font-medium">{localizedName(row.title, locale)}</p>
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
