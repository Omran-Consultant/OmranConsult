"use client";

import { useTranslations } from "next-intl";

import { ComingSoon } from "@/features/dashboard/shell/coming-soon";

export default function Page() {
  const t = useTranslations("Dashboard.nav");
  return <ComingSoon title={t("inquiries")} />;
}
