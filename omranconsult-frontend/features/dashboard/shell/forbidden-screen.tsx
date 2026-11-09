"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/features/dashboard/ui/page-header";

export function ForbiddenScreen() {
  const t = useTranslations("Dashboard");

  return (
    <div className="py-8" data-ready="true">
      <PageHeader subtitle={t("forbiddenBody")} title={t("forbidden")} />
    </div>
  );
}
