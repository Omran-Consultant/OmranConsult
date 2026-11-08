"use client";

import { useTranslations } from "next-intl";

import { EmptyState } from "@/core/ui/empty-state";

export function ComingSoon({ title }: { title: string }) {
  const t = useTranslations("Dashboard");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-h3">{title}</h1>
      <EmptyState description={t("comingSoon")} title={title} />
    </div>
  );
}
