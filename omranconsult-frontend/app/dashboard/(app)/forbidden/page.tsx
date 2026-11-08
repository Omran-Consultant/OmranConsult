"use client";

import { useTranslations } from "next-intl";

export default function ForbiddenPage() {
  const t = useTranslations("Dashboard");
  return (
    <div className="py-16 text-center">
      <h1 className="font-display text-h3">{t("forbidden")}</h1>
    </div>
  );
}
