import type { AppLocale } from "@/i18n/routing";

export function dashboardIntlLocale(locale: AppLocale): string {
  return locale === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB";
}

export function formatDashboardNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(dashboardIntlLocale(locale), {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardPercent(value: number, locale: AppLocale): string {
  return `${formatDashboardNumber(value, locale)}%`;
}
