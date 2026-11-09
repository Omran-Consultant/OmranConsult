"use client";

import { useTranslations } from "next-intl";

import { EmptyState } from "@/core/ui/empty-state";
import { PageHeader } from "@/features/dashboard/ui/page-header";

export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("Dashboard");
  return (
    <div className="space-y-4" data-ready="true">
      <PageHeader subtitle={t("comingSoon")} title={title} />
      <EmptyState description={t("comingSoon")} title={title} />
    </div>
  );
}
