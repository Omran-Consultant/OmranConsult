"use client";

import { formatFullDateTime, formatRelativeTime } from "@/features/dashboard/format/relative-time";
import type { AppLocale } from "@/i18n/routing";

export function RelativeTime({
  value,
  locale,
  className,
}: {
  value: string | null | undefined;
  locale: AppLocale;
  className?: string;
}) {
  const relative = formatRelativeTime(value, locale);
  const full = formatFullDateTime(value, locale);

  return (
    <time className={className} dateTime={value ?? undefined} title={full}>
      {relative}
    </time>
  );
}
