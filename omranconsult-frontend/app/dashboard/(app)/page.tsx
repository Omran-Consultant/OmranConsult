"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/core/ui/skeleton";
import { DashboardHomeView } from "@/features/dashboard/home/dashboard-home-view";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import type { AppLocale } from "@/i18n/routing";
import { adminSummary } from "@/lib/api/admin-browser";
import type { AdminSummaryResponse } from "@/lib/api/types";

export default function DashboardHomePage() {
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const locale: AppLocale = readDashboardLocaleFromDocument();

  useEffect(() => {
    void adminSummary().then(setData);
  }, []);

  if (!data) {
    return <Skeleton className="h-40" />;
  }

  return <DashboardHomeView data={data} locale={locale} />;
}
