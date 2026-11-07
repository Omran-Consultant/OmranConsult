import type { AppLocale } from "@/i18n/routing";

type StatisticValueInput = {
  value: number;
  scale?: string | null;
  suffix?: string | null;
  locale: AppLocale;
};

const SCALE_LABELS: Record<string, string> = {
  billion: "B",
};

export function formatStatisticValue({
  value,
  scale,
  suffix,
  locale,
}: StatisticValueInput): string {
  const formattedNumber = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

  const scaleLabel = scale ? (SCALE_LABELS[scale] ?? scale) : "";
  const suffixLabel = suffix ?? "";

  return `${formattedNumber}${scaleLabel}${suffixLabel}`;
}
