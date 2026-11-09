import { formatDashboardNumber, formatDashboardPercent } from "@/features/dashboard/format/format-dashboard-number";
import type { AppLocale } from "@/i18n/routing";

const PALETTE = ["#0E8442", "#1B5FA8", "#C98A0B", "#4A5F7D", "#C2413A", "#5a7ba3"];

export type DonutSlice = { id: string; label: string; value: number; color?: string };

export function DonutChart({
  slices,
  locale,
  title,
  centerLabel,
}: {
  slices: DonutSlice[];
  locale: AppLocale;
  title: string;
  centerLabel: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const safeTotal = Math.max(1, total);
  const arcs = slices.map((slice, index) => {
    const used = slices.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    const pct = (slice.value / safeTotal) * 100;
    return {
      ...slice,
      dash: `${pct} ${100 - pct}`,
      offset: 25 - (used / safeTotal) * 100,
      color: slice.color ?? PALETTE[index % PALETTE.length],
    };
  });

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <div className="relative mx-auto size-40">
        <svg aria-label={title} className="size-40" role="img" viewBox="0 0 42 42">
          <circle cx="21" cy="21" fill="transparent" r="15.915" stroke="var(--border-subtle)" strokeWidth="6" />
          {arcs.map((slice) => (
            <circle
              cx="21"
              cy="21"
              fill="transparent"
              key={slice.id}
              r="15.915"
              stroke={slice.color}
              strokeDasharray={slice.dash}
              strokeDashoffset={slice.offset}
              strokeWidth="6"
            />
          ))}
        </svg>
        <div className="absolute inset-0 grid place-items-center px-8 text-center">
          <p className="font-display text-body-s font-semibold text-primary">{centerLabel}</p>
        </div>
      </div>
      <table className="w-full text-start text-body-s">
        <caption className="sr-only">{title}</caption>
        <tbody>
          {slices.map((slice, index) => (
            <tr key={slice.id}>
              <th className="py-1 pe-3 font-normal">
                <span
                  className="me-2 inline-block size-2 rounded-sm"
                  style={{ background: slice.color ?? PALETTE[index % PALETTE.length] }}
                />
                {slice.label}
              </th>
              <td className="w-12 text-end font-medium tabular-nums text-primary">
                {formatDashboardNumber(slice.value, locale)}
              </td>
              <td className="w-14 text-end tabular-nums text-muted">
                {formatDashboardPercent(Math.round((slice.value / safeTotal) * 100), locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
