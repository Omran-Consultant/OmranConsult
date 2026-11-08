type DateLocale = "ar" | "en";

/** Gregorian calendar and Latin digits in both locales, as in the Figma screens («ديسمبر 2024»). */
const INTL_LOCALE: Record<DateLocale, string> = { ar: "ar-SA-u-ca-gregory-nu-latn", en: "en-GB" };

function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return undefined;
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatMonthYear(value: string | undefined, locale: DateLocale): string | undefined {
  const date = parseIsoDate(value);
  return date ? new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(date) : undefined;
}

export function formatYear(value: string | undefined): string | undefined {
  return parseIsoDate(value) ? value?.slice(0, 4) : undefined;
}
