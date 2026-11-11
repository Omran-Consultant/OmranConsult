"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { HeroSlidesTab } from "@/features/dashboard/pages/hero-slides-tab";
import { HomeSectorsTab } from "@/features/dashboard/pages/home-sectors-tab";
import { PagesTab } from "@/features/dashboard/pages/pages-tab";
import { StatisticsTab } from "@/features/dashboard/pages/statistics-tab";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import type { AppLocale } from "@/i18n/routing";

const TABS = ["pages", "slides", "statistics", "sectors"] as const;
type TabId = (typeof TABS)[number];

/** Site pages (5B-3a). The open tab lives in the URL so a link or the back button returns to it. */
export default function SitePagesPage() {
  const t = useTranslations("Dashboard.pages");
  const router = useRouter();
  const search = useSearchParams();
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const requested = search.get("tab");
  const tab: TabId = TABS.find((id) => id === requested) ?? "pages";

  return (
    <div className="space-y-6">
      <PageHeader subtitle={t("subtitle")} title={t("title")} />
      <DashboardTabs
        active={tab}
        onChange={(next) => router.replace(next === "pages" ? "/dashboard/pages" : `/dashboard/pages?tab=${next}`)}
        tabs={[
          { id: "pages", label: t("tabPages") },
          { id: "slides", label: t("tabSlides") },
          { id: "statistics", label: t("tabStatistics") },
          { id: "sectors", label: t("tabSectors") },
        ]}
      />
      {tab === "pages" ? <PagesTab locale={locale} /> : null}
      {tab === "slides" ? <HeroSlidesTab locale={locale} /> : null}
      {tab === "statistics" ? <StatisticsTab locale={locale} /> : null}
      {tab === "sectors" ? <HomeSectorsTab locale={locale} /> : null}
    </div>
  );
}
