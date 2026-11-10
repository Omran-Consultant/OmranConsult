"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { formatFullDateTime } from "@/features/dashboard/format/relative-time";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { ConfirmDialog } from "@/features/dashboard/ui/confirm-dialog";
import { controlMdClass, controlRowClass } from "@/features/dashboard/ui/control-styles";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { FilterBar } from "@/features/dashboard/ui/filter-bar";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { DashboardPagination } from "@/features/dashboard/ui/pagination";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import { ViewToggle } from "@/features/dashboard/ui/view-toggle";
import type { AppLocale } from "@/i18n/routing";
import { adminCreateNews, adminDeleteNews, adminNews, adminRestoreNews } from "@/lib/api/admin-browser";
import type { AdminLookup, AdminNewsListItem } from "@/lib/api/types";

type DemoFilter = "all" | "demo" | "real";
type StatusFilter = "all" | "published" | "draft" | "trashed" | "published_with_draft";

function label(value: { ar?: string | null; en?: string | null } | null | undefined, locale: AppLocale): string {
  if (!value) return "—";
  return (locale === "ar" ? value.ar : value.en) || value.ar || value.en || "—";
}

function CoverThumb({ coverUrl }: { coverUrl?: string | null }) {
  if (coverUrl) {
    return <Image alt="" className="size-11 shrink-0 rounded-lg object-cover" height={44} src={coverUrl} width={44} />;
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-highlight text-muted">
      <Icon name="image" />
    </span>
  );
}

export default function NewsListPage() {
  const t = useTranslations("Dashboard.news");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const router = useRouter();
  const [items, setItems] = useState<AdminNewsListItem[]>([]);
  const [categories, setCategories] = useState<AdminLookup[]>([]);
  const [q, setQ] = useState("");
  const [demo, setDemo] = useState<DemoFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("");
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminNewsListItem | null>(null);

  function reload() {
    return adminNews().then((payload) => {
      setItems(payload.data);
      setCategories(payload.lookups?.categories ?? []);
      setLoaded(true);
    });
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload().catch(() => setLoaded(true));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      if (demo === "demo" && !item.is_demo) return false;
      if (demo === "real" && item.is_demo) return false;
      if (status !== "all" && item.status !== status) return false;
      if (category && item.category?.slug !== category) return false;
      if (query) {
        const title = label(item.title, locale).toLowerCase();
        if (!title.includes(query) && !item.slug.toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [items, demo, status, category, q, locale]);

  const counts = useMemo(
    () => ({
      all: items.length,
      demo: items.filter((item) => item.is_demo).length,
      real: items.filter((item) => !item.is_demo).length,
      published: items.filter((item) => item.status === "published").length,
      draft: items.filter((item) => item.status === "draft").length,
      trashed: items.filter((item) => item.status === "trashed").length,
    }),
    [items],
  );

  const columns = [
    {
      id: "select",
      header: t("select"),
      width: "48px",
      cell: (row: AdminNewsListItem) => (
        <input
          aria-label={t("selectRow")}
          checked={selected.includes(row.id)}
          onChange={(event) => {
            event.stopPropagation();
            setSelected((current) => (event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id)));
          }}
          onClick={(event) => event.stopPropagation()}
          type="checkbox"
        />
      ),
    },
    {
      id: "article",
      header: t("colArticle"),
      width: "360px",
      cell: (row: AdminNewsListItem) => (
        <Link className="flex min-w-0 items-center gap-3" data-news-id={String(row.id)} href={`/dashboard/news/${row.id}`}>
          <CoverThumb coverUrl={row.cover_url} />
          <span className="min-w-0">
            <span className="line-clamp-2 block leading-5 font-medium">{label(row.title, locale)}</span>
            <span className="block truncate text-caption leading-4 text-muted" dir="ltr">
              {row.slug}
            </span>
          </span>
        </Link>
      ),
    },
    {
      id: "category",
      header: t("colCategory"),
      width: "140px",
      cell: (row: AdminNewsListItem) => <span className="line-clamp-2">{row.category ? label(row.category.name, locale) : "—"}</span>,
    },
    {
      id: "published",
      header: t("colPublished"),
      width: "150px",
      className: "whitespace-nowrap",
      cell: (row: AdminNewsListItem) => (
        <span className="text-caption text-secondary">{row.published_at ? formatFullDateTime(row.published_at, locale) : "—"}</span>
      ),
    },
    {
      id: "status",
      header: t("colStatus"),
      width: "160px",
      cell: (row: AdminNewsListItem) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <StatusPill locale={locale} status={row.status} />
          {row.is_demo ? <span className="rounded-full bg-highlight px-2 py-0.5 text-caption text-secondary">{t("demoBadge")}</span> : null}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6" data-ready="true" data-dashboard-toolbar>
      <PageHeader
        actions={
          <DashboardButton icon={<Icon name="plus" />} onClick={() => void adminCreateNews().then((created) => router.push(`/dashboard/news/${created.id}`))} type="button">
            {t("add")}
          </DashboardButton>
        }
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <DashboardTabs
        active={demo}
        onChange={(tab) => setDemo(tab as DemoFilter)}
        tabs={[
          { id: "all", label: t("tabAll"), count: counts.all },
          { id: "demo", label: t("tabDemo"), count: counts.demo },
          { id: "real", label: t("tabReal"), count: counts.real },
        ]}
      />
      <DashboardTabs
        active={status}
        onChange={(tab) => setStatus(tab as StatusFilter)}
        tabs={[
          { id: "all", label: t("tabAll"), count: filtered.length },
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
        <select aria-label={t("filterCategory")} className={`${controlMdClass} w-44`} onChange={(event) => setCategory(event.target.value)} value={category}>
          <option value="">{t("filterCategory")}: {t("filterAll")}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {label(item.name, locale)}
            </option>
          ))}
        </select>
        <ViewToggle gridLabel={t("viewGrid")} onChange={setView} tableLabel={t("viewTable")} value={view} />
      </FilterBar>
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-elevated px-4 py-3">
          <p className="text-label-s text-secondary">{t("selectedCount", { count: selected.length })}</p>
          <DashboardButton
            onClick={() => {
              void Promise.all(selected.map((id) => adminDeleteNews(id))).then(reload).then(() => setSelected([]));
            }}
            type="button"
            variant="ghost"
          >
            {t("bulkDelete")}
          </DashboardButton>
        </div>
      ) : null}
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
                <span className="text-caption text-muted">{row.published_at ? formatFullDateTime(row.published_at, locale) : "—"}</span>
              </div>
            </article>
          )}
          onRowClick={(row) => router.push(`/dashboard/news/${row.id}`)}
          rowActions={(row) => (
            <>
              <RowActionButton label={t("preview")} onClick={() => window.open(`/${locale}/media/${row.slug}`, "_blank", "noopener")}>
                <Icon name="eye" />
              </RowActionButton>
              <RowActionButton label={t("edit")} onClick={() => router.push(`/dashboard/news/${row.id}`)}>
                <Icon name="edit" />
              </RowActionButton>
              {row.status === "trashed" ? (
                <RowActionButton label={t("restore")} onClick={() => void adminRestoreNews(row.id).then(reload)}>
                  <Icon name="check" />
                </RowActionButton>
              ) : (
                <RowActionButton label={t("delete")} onClick={() => setPendingDelete(row)}>
                  <Icon name="trash" />
                </RowActionButton>
              )}
            </>
          )}
          rows={filtered}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row) => (
            <Link className="rounded-2xl border border-line bg-elevated p-4 text-start transition-shadow hover:shadow-[var(--elevation-lift)]" data-news-id={String(row.id)} href={`/dashboard/news/${row.id}`} key={row.id}>
              <div className="mb-3 overflow-hidden rounded-xl bg-highlight">
                {row.cover_url ? (
                  <Image alt="" className="aspect-video w-full object-cover" height={180} src={row.cover_url} width={320} />
                ) : (
                  <div className="grid aspect-video place-items-center text-muted">
                    <Icon name="image" />
                  </div>
                )}
              </div>
              <p className="line-clamp-2 font-medium">{label(row.title, locale)}</p>
              <p className="text-caption text-muted" dir="ltr">
                {row.slug}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <StatusPill locale={locale} status={row.status} />
                <span className="text-caption text-muted">{row.published_at ? formatFullDateTime(row.published_at, locale) : "—"}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      <DashboardPagination from={filtered.length === 0 ? 0 : 1} hasNext={false} hasPrev={false} locale={locale} onNext={() => undefined} onPrev={() => undefined} to={filtered.length} total={filtered.length} />
      <ConfirmDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        destructive
        message={t("deleteConfirm", { name: pendingDelete ? label(pendingDelete.title, locale) : "" })}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const target = pendingDelete;
          setPendingDelete(null);
          void adminDeleteNews(target.id).then(reload);
        }}
        open={pendingDelete !== null}
        title={t("delete")}
      />
    </div>
  );
}
