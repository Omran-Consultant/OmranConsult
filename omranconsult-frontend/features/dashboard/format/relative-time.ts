import type { AppLocale } from "@/i18n/routing";

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatRelativeTime(value: string | null | undefined, locale: AppLocale, now = new Date()): string {
  const date = parseTimestamp(value);
  if (!date) {
    return locale === "ar" ? "—" : "—";
  }

  const diff = now.getTime() - date.getTime();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diff < MINUTE) {
    return locale === "ar" ? "الآن" : "Just now";
  }
  if (diff < HOUR) {
    return rtf.format(-Math.round(diff / MINUTE), "minute");
  }
  if (diff < DAY) {
    return rtf.format(-Math.round(diff / HOUR), "hour");
  }
  if (diff < DAY * 2) {
    return locale === "ar" ? "أمس" : "Yesterday";
  }
  if (diff < DAY * 7) {
    return rtf.format(-Math.round(diff / DAY), "day");
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function formatFullDateTime(value: string | null | undefined, locale: AppLocale): string {
  const date = parseTimestamp(value);
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
