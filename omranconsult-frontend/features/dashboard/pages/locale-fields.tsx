"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

import { DashboardTabs } from "@/features/dashboard/ui/tabs";

/** «العربية | English» tabs over one form: both languages stay mounted so one save carries both. */
export function LocaleFields({ children }: { readonly children: (lang: "ar" | "en") => ReactNode }) {
  const t = useTranslations("Dashboard.pages");
  const [lang, setLang] = useState<"ar" | "en">("ar");

  return (
    <div className="space-y-4">
      <DashboardTabs
        active={lang}
        onChange={(tab) => setLang(tab as "ar" | "en")}
        tabs={[
          { id: "ar", label: t("localeAr") },
          { id: "en", label: t("localeEn") },
        ]}
      />
      {(["ar", "en"] as const).map((code) => (
        <div className={code === lang ? "space-y-4" : "hidden"} key={code}>
          {children(code)}
        </div>
      ))}
    </div>
  );
}
