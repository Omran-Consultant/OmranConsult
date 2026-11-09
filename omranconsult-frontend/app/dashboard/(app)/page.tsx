"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { EmptyState } from "@/core/ui/empty-state";
import { Skeleton } from "@/core/ui/skeleton";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import type { AppLocale } from "@/i18n/routing";
import { adminSummary } from "@/lib/api/admin-browser";
import type { AdminSummaryResponse } from "@/lib/api/types";

export default function DashboardHomePage() {
  const t = useTranslations("Dashboard.home");
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const locale: AppLocale = readDashboardLocaleFromDocument();

  useEffect(() => {
    void adminSummary().then(setData);
  }, []);

  if (!data) {
    return <Skeleton className="h-40" />;
  }

  const cards = [
    { kpi: "projects", label: t("projects"), value: `${data.kpis.projects_published} / ${data.kpis.projects_draft}` },
    { kpi: "inquiries", label: t("inquiries"), value: String(data.kpis.inquiries_new) },
    { kpi: "drafts", label: t("drafts"), value: String(data.kpis.drafts_awaiting_publish) },
    { kpi: "disputes", label: t("disputes"), value: String(data.kpis.open_disputes) },
    { kpi: "expired", label: t("expired"), value: String(data.kpis.expired_certificates) },
  ];

  const max = Math.max(1, ...data.inquiries_chart.map((row) => row.count));
  const sectorTotal = Math.max(1, data.sectors.reduce((sum, sector) => sum + sector.count, 0));
  const sectorSlices = data.sectors.map((sector, index) => {
    const value = (sector.count / sectorTotal) * 100;
    const start = data.sectors
      .slice(0, index)
      .reduce((sum, item) => sum + (item.count / sectorTotal) * 100, 0);
    return { slug: sector.slug, value, start };
  });

  return (
    <div className="space-y-8" data-ready="true">
      <div>
        <h1 className="font-display text-h3">{t("title")}</h1>
        <p className="text-body-s text-secondary">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article className="rounded-2xl border border-line bg-elevated p-5" key={card.label}>
            <p className="text-caption text-muted">{card.label}</p>
            <p className="mt-2 font-display text-h3" data-kpi={card.kpi}>
              {card.value}
            </p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("chart")}</h2>
          {data.inquiries_chart.every((row) => row.count === 0) ? (
            <div className="mt-4">
              <EmptyState title={t("chartEmpty")} />
            </div>
          ) : (
            <svg aria-label={t("chart")} className="mt-4 h-40 w-full text-accent" role="img" viewBox="0 0 240 80">
              {data.inquiries_chart.map((row, index) => (
                <rect fill="currentColor" height={(row.count / max) * 70} key={row.month} width="14" x={index * 20} y={80 - (row.count / max) * 70} />
              ))}
            </svg>
          )}
          <table className="sr-only">
            <tbody>
              {data.inquiries_chart.map((row) => (
                <tr key={row.month}>
                  <th>{row.month}</th>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("sectors")}</h2>
          {data.sectors.every((sector) => sector.count === 0) ? (
            <div className="mt-4">
              <EmptyState title={t("sectorsEmpty")} />
            </div>
          ) : (
            <svg aria-label={t("sectors")} className="mx-auto mt-4 size-40" role="img" viewBox="0 0 42 42">
              {sectorSlices.map((slice) => (
                <circle
                  cx="21"
                  cy="21"
                  fill="transparent"
                  key={slice.slug}
                  r="15.915"
                  stroke="currentColor"
                  strokeDasharray={`${slice.value} ${100 - slice.value}`}
                  strokeDashoffset={25 - slice.start}
                  strokeWidth="6"
                />
              ))}
            </svg>
          )}
          <table className="mt-4 w-full text-start text-body-s">
            <tbody>
              {data.sectors.map((sector) => (
                <tr key={sector.slug}>
                  <th className="py-1 font-normal">{locale === "ar" ? sector.name.ar : sector.name.en}</th>
                  <td className="text-muted">{sector.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ListBlock
          empty={t("inquiriesEmpty")}
          items={data.latest_inquiries.map((row) => ({
            id: row.id,
            title: row.name,
            meta: row.status,
          }))}
          title={t("latestInquiries")}
        />
        <ListBlock
          empty={t("editsEmpty")}
          items={data.latest_edits.map((row) => ({
            id: row.id,
            title: locale === "ar" ? row.title.ar : row.title.en,
            meta: row.status,
          }))}
          title={t("latestEdits")}
        />
        <ListBlock
          empty={t("activityEmpty")}
          items={data.recent_activity.map((row) => ({
            id: row.id,
            title: row.action,
            meta: row.occurred_at,
          }))}
          title={t("recentActivity")}
        />
      </div>
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
  items: { id: number; title: string; meta: string }[];
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
              <span className="truncate">{item.title}</span>
              <span className="shrink-0 text-caption text-muted">{item.meta}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
