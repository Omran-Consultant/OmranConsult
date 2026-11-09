"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState, type ReactNode } from "react";

import { Icon } from "@/core/ui/icon";
import { EmptyState } from "@/core/ui/empty-state";
import { formatDashboardNumber } from "@/features/dashboard/format/format-dashboard-number";
import { activitySentence, prepareActivityFeed } from "@/features/dashboard/home/activity-feed";
import { labelAuditAction } from "@/features/dashboard/labels";
import { KpiCard } from "@/features/dashboard/ui/kpi-card";
import { BarChart } from "@/features/dashboard/ui/charts/bar-chart";
import { DonutChart } from "@/features/dashboard/ui/charts/donut-chart";
import { Sparkline } from "@/features/dashboard/ui/charts/sparkline";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { Avatar } from "@/features/dashboard/ui/avatar";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardSwitch } from "@/features/dashboard/ui/dashboard-field";
import type { AppLocale } from "@/i18n/routing";
import type { AdminSummaryResponse } from "@/lib/api/types";

const KPI_COLORS = {
  projects: "#0e8442",
  inquiries: "#1B5FA8",
  drafts: "#4a5568",
  disputes: "#f5a524",
  certificates: "#e5484d",
};

export function DashboardHomeView({ data, locale }: { data: AdminSummaryResponse; locale: AppLocale }) {
  const t = useTranslations("Dashboard.home");
  const kpis = data.kpis;
  const published = kpis.projects_published;
  const draft = kpis.projects_draft;
  const publishedRatio = kpis.projects_total > 0 ? published / kpis.projects_total : 0;
  const [showLogins, setShowLogins] = useState(false);

  const inquiryDelta = kpis.inquiries_this_month - kpis.inquiries_last_month;
  const hasInquirySeries = data.inquiries_chart.some((row) => row.count > 0);
  const deltaLabel =
    inquiryDelta > 0
      ? t("inquiriesDeltaUp", { n: formatDashboardNumber(inquiryDelta, locale) })
      : inquiryDelta < 0
        ? t("inquiriesDeltaDown", { n: formatDashboardNumber(Math.abs(inquiryDelta), locale) })
        : t("inquiriesDeltaFlat");
  const deltaTone = inquiryDelta > 0 ? "text-success" : inquiryDelta < 0 ? "text-danger" : "text-muted";

  const sectorRows = data.sectors.map((sector) => ({
    id: sector.slug,
    label: locale === "ar" ? sector.name.ar : sector.name.en,
    value: sector.count,
  }));

  const chartRows = data.inquiries_chart.map((row) => ({
    id: row.month,
    label: row.month,
    value: row.count,
  }));

  const activity = useMemo(
    () =>
      prepareActivityFeed(
        data.recent_activity.map((row) => ({
          id: row.id,
          action: row.action,
          occurred_at: row.occurred_at,
          user_id: row.user_id,
          user_name: row.user_name,
        })),
        { includeLogins: showLogins },
      ),
    [data.recent_activity, showLogins],
  );

  return (
    <div className="space-y-8" data-ready="true">
      <PageHeader subtitle={t("subtitle")} title={t("title")} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <KpiCard
          accent={KPI_COLORS.projects}
          footer={
            <div className="flex w-full flex-col gap-2">
              <Progress ratio={publishedRatio} />
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1" data-kpi="projects">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-success" />
                  <span data-kpi="projects-published">{formatDashboardNumber(published, locale)}</span>
                  <span>{locale === "ar" ? "منشور" : "published"}</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-highlight" />
                  <span data-kpi="projects-draft">{formatDashboardNumber(draft, locale)}</span>
                  <span>{locale === "ar" ? "مسودة" : "draft"}</span>
                </span>
              </span>
            </div>
          }
          href="/dashboard/projects"
          icon={<Icon name="layers" />}
          label={t("kpiProjects")}
          locale={locale}
          unit={t("publishedUnit")}
          value={kpis.projects_total}
        />
        <KpiCard
          accent={KPI_COLORS.inquiries}
          footer={
            !hasInquirySeries && kpis.inquiries_this_month === 0 ? (
              <span>{t("inquiriesEmptyMonth")}</span>
            ) : (
              <div className="flex w-full items-center justify-between gap-2">
                <Sparkline color={KPI_COLORS.inquiries} values={data.inquiries_chart.map((row) => row.count)} />
                <span className={`${deltaTone} shrink-0 whitespace-nowrap`}>{deltaLabel}</span>
              </div>
            )
          }
          href="/dashboard/inquiries"
          icon={<Icon name="mail" />}
          label={t("kpiInquiries")}
          locale={locale}
          unit={t("unitThisMonth")}
          value={kpis.inquiries_this_month}
        />
        <KpiCard
          accent={KPI_COLORS.drafts}
          footer={
            <div className="flex w-full items-center justify-between gap-2">
              <RelativeTime locale={locale} value={kpis.last_content_edit_at} />
              <Link className="text-accent underline" href="/dashboard/projects?status=draft">
                {t("review")}
              </Link>
            </div>
          }
          href="/dashboard/projects"
          dataKpi="drafts"
          icon={<Icon name="edit" />}
          label={t("kpiDrafts")}
          locale={locale}
          unit={t("unitItems")}
          value={kpis.drafts_awaiting_publish}
        />
        <KpiCard
          accent={KPI_COLORS.disputes}
          footer={
            <div className="flex w-full items-center justify-between gap-2">
              {kpis.disputes_blocking_publish > 0 ? (
                <span className="rounded-full bg-warning/15 px-2 py-0.5 text-caption text-warning">
                  {t("blockersCount", { n: formatDashboardNumber(kpis.disputes_blocking_publish, locale) })}
                </span>
              ) : (
                <span>{t("noBlockers")}</span>
              )}
              <Link className="text-accent underline" href="/dashboard/disputes">
                {t("view")}
              </Link>
            </div>
          }
          href="/dashboard/disputes"
          icon={<Icon name="shield-check" />}
          label={t("kpiDisputes")}
          locale={locale}
          unit={t("unitNotes")}
          value={kpis.open_disputes}
        />
        <KpiCard
          accent={kpis.expired_certificates === 0 ? KPI_COLORS.projects : KPI_COLORS.certificates}
          footer={
            kpis.expired_certificates === 0 ? (
              <span className="text-success">{t("allCertsValid")}</span>
            ) : (
              <div className="flex w-full items-center justify-between gap-2">
                <span className="rounded-full bg-danger/15 px-2 py-0.5 text-caption font-medium text-[#b42318] dark:text-[#fca5a5]">
                  {t("renewalNeeded")}
                </span>
                <Link className="text-accent underline" href="/dashboard/documents">
                  {t("view")}
                </Link>
              </div>
            )
          }
          href="/dashboard/documents"
          icon={<Icon name="file" />}
          label={t("kpiCertificates")}
          locale={locale}
          unit={
            locale === "ar"
              ? `من ${formatDashboardNumber(kpis.certificates_total, locale)} شهادة`
              : `of ${formatDashboardNumber(kpis.certificates_total, locale)} certs`
          }
          value={kpis.expired_certificates}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("chart")}</h2>
          {data.inquiries_chart.every((row) => row.count === 0) ? (
            <div className="mt-4">
              <EmptyState title={t("chartEmpty")} />
            </div>
          ) : (
            <div className="mt-4">
              <BarChart color="var(--accent)" locale={locale} rows={chartRows} title={t("chart")} />
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("sectors")}</h2>
          {data.sectors.every((sector) => sector.count === 0) ? (
            <div className="mt-4">
              <EmptyState title={t("sectorsEmpty")} />
            </div>
          ) : (
            <div className="mt-4">
              <DonutChart
                centerLabel={t("donutCenter", { n: formatDashboardNumber(published, locale) })}
                locale={locale}
                slices={sectorRows.map((row) => ({ id: row.id, label: row.label, value: row.value }))}
                title={t("sectors")}
              />
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ListBlock
          empty={t("inquiriesEmpty")}
          items={data.latest_inquiries.map((row) => ({
            id: row.id,
            title: row.name,
            meta: <StatusPill locale={locale} status={row.status} />,
          }))}
          title={t("latestInquiries")}
        />
        <ListBlock
          empty={t("editsEmpty")}
          items={data.latest_edits.map((row) => ({
            id: row.id,
            title: locale === "ar" ? row.title.ar : row.title.en,
            meta: (
              <div className="flex items-center gap-2">
                <StatusPill locale={locale} status={row.status} />
                <RelativeTime locale={locale} value={row.updated_at} />
              </div>
            ),
          }))}
          title={t("latestEdits")}
        />
        <section className="rounded-2xl border border-line bg-elevated p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-h5">{t("recentActivity")}</h2>
            <DashboardSwitch compact id="show-logins" label={t("showLogins")} checked={showLogins} onChange={setShowLogins} />
          </div>
          {activity.length === 0 ? (
            <EmptyState title={t("activityEmpty")} />
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((item) => (
                <li className="flex items-center justify-between gap-3 py-2 text-body-s" key={item.id}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Avatar name={item.user_name ?? item.action} />
                    <span className="truncate">
                      {activitySentence(item, labelAuditAction(item.action, locale), locale)}
                    </span>
                  </span>
                  <RelativeTime className="shrink-0 text-caption text-muted" locale={locale} value={item.occurred_at} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Progress({ ratio }: { ratio: number }) {
  return (
    <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-highlight">
      <div className="h-full rounded-full bg-success" style={{ width: `${Math.round(ratio * 100)}%` }} />
    </div>
  );
}

function ListBlock({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: number; title: ReactNode; meta: ReactNode }[];
}) {
  return (
    <section className="rounded-2xl border border-line bg-elevated p-5">
      <h2 className="text-h5">{title}</h2>
      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={empty} />
        </div>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li className="flex items-center justify-between gap-3 py-2 text-body-s" key={item.id}>
              <span className="min-w-0 truncate">{item.title}</span>
              <span className="shrink-0 text-caption text-muted">{item.meta}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
