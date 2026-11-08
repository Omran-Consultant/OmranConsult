import type { AppLocale } from "@/i18n/routing";

export const DASHBOARD_LOCALE_COOKIE = "DASHBOARD_LOCALE";

export function parseDashboardLocale(value: string | null | undefined): AppLocale {
  return value === "en" ? "en" : "ar";
}

export function readDashboardLocaleFromDocument(): AppLocale {
  if (typeof document === "undefined") {
    return "ar";
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${DASHBOARD_LOCALE_COOKIE}=([^;]*)`));
  return parseDashboardLocale(match?.[1] ? decodeURIComponent(match[1]) : null);
}

export function persistDashboardLocale(locale: AppLocale): void {
  document.cookie = `${DASHBOARD_LOCALE_COOKIE}=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
}

export function safeDashboardNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/dashboard")) {
    return "/dashboard";
  }
  if (next.startsWith("//") || next.includes("://") || next.includes("\\")) {
    return "/dashboard";
  }
  return next;
}
