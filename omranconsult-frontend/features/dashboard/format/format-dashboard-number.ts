import type { AppLocale } from "@/i18n/routing";

export function formatDashboardNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-arab" : "en", {
    maximumFractionDigits: 0,
  }).format(value);
}
