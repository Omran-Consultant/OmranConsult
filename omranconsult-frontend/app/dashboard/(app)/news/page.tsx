"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import type { AppLocale } from "@/i18n/routing";
import { adminCreateNews, adminDeleteNews, adminNews, adminRestoreNews } from "@/lib/api/admin-browser";
import type { AdminNewsListItem } from "@/lib/api/types";

function label(value: { ar?: string | null; en?: string | null } | null | undefined, locale: AppLocale): string {
  if (!value) return "—";
  return (locale === "ar" ? value.ar : value.en) || value.ar || value.en || "—";
}

export default function NewsListPage() {
  const t = useTranslations("Dashboard.news");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const router = useRouter();
  const [items, setItems] = useState<AdminNewsListItem[]>([]);
  const [demo, setDemo] = useState<"all" | "demo" | "real">("all");
  const [loaded, setLoaded] = useState(false);

  async function reload() {
    const payload = await adminNews();
    setItems(payload.data);
    setLoaded(true);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload().catch(() => setLoaded(true));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  const visible = useMemo(() => {
    if (demo === "demo") return items.filter((item) => item.is_demo);
    if (demo === "real") return items.filter((item) => !item.is_demo);
    return items;
  }, [demo, items]);

  const counts = useMemo(
    () => ({
      all: items.length,
      demo: items.filter((item) => item.is_demo).length,
      real: items.filter((item) => !item.is_demo).length,
    }),
    [items],
  );

  if (!loaded) {
    return <p className="text-muted" data-ready="false">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={
          <DashboardButton
            icon={<Icon name="plus" />}
            onClick={() => void adminCreateNews().then((created) => router.push(`/dashboard/news/${created.id}`))}
            type="button"
          >
            {t("add")}
          </DashboardButton>
        }
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <DashboardTabs
        active={demo}
        onChange={(tab) => setDemo(tab as typeof demo)}
        tabs={[
          { id: "all", label: `${t("tabAll")} (${counts.all})` },
          { id: "demo", label: `${t("tabDemo")} (${counts.demo})` },
          { id: "real", label: `${t("tabReal")} (${counts.real})` },
        ]}
      />
      <ul className="space-y-3">
        {visible.map((item) => (
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-elevated p-4" key={item.id}>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link className="truncate text-label-m text-primary hover:text-accent" data-news-id={item.id} href={`/dashboard/news/${item.id}`}>
                  {label(item.title, locale)}
                </Link>
                {item.is_demo ? <span className="rounded-full bg-highlight px-2 py-0.5 text-caption text-secondary">{t("demoBadge")}</span> : null}
                <StatusPill locale={locale} status={item.status} />
              </div>
              <p className="text-caption text-muted">
                {item.category ? label(item.category.name, locale) : "—"} · <RelativeTime locale={locale} value={item.updated_at} />
              </p>
            </div>
            <div className="flex gap-2">
              {item.status === "trashed" ? (
                <DashboardButton onClick={() => void adminRestoreNews(item.id).then(reload)} type="button" variant="secondary">
                  {t("restore")}
                </DashboardButton>
              ) : (
                <DashboardButton onClick={() => void adminDeleteNews(item.id).then(reload)} type="button" variant="ghost">
                  {t("delete")}
                </DashboardButton>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
