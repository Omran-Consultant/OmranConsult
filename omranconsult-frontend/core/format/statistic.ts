import type { AppLocale } from "@/i18n/routing";

type StatisticValueInput = {
  value: number;
  scale?: string | null;
  suffix?: string | null;
  /** A "%" unit is part of the figure (72.92%); currency units are shown in labels instead. */
  unit?: string | null;
  locale: AppLocale;
};

const SCALE_LABELS: Record<string, string> = {
  billion: "B",
};

export function formatStatisticValue({
  value,
  scale,
  suffix,
  unit,
  locale,
}: StatisticValueInput): string {
  const formattedNumber = new Intl.NumberFormat(locale, {
    numberingSystem: "latn",
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);

  const scaleLabel = scale ? (SCALE_LABELS[scale] ?? scale) : "";
  const suffixLabel = suffix ?? "";

  const unitLabel = unit === "%" && suffix !== "%" ? "%" : "";

  return `${formattedNumber}${scaleLabel}${unitLabel}${suffixLabel}`;
}
