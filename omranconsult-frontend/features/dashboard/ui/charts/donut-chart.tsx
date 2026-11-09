import { formatDashboardNumber } from "@/features/dashboard/format/format-dashboard-number";
import type { AppLocale } from "@/i18n/routing";

const PALETTE = ["#0E8442", "#1B5FA8", "#C98A0B", "#4A5F7D", "#C2413A", "#5a7ba3"];

export type DonutSlice = { id: string; label: string; value: number; color?: string };

export function DonutChart({
  slices,
  locale,
  title,
}: {
  slices: DonutSlice[];
  locale: AppLocale;
  title: string;
}) {
  const total = Math.max(1, slices.reduce((sum, slice) => sum + slice.value, 0));
  let offset = 25;
  const arcs = slices.map((slice, index) => {
    const pct = (slice.value / total) * 100;
    const dash = `${pct} ${100 - pct}`;
    const arc = { ...slice, dash, offset, color: slice.color ?? PALETTE[index % PALETTE.length] };
    offset -= pct;
    return arc;
  });

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
      <svg aria-label={title} className="mx-auto size-40" role="img" viewBox="0 0 42 42">
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
              <td className="text-muted">
                {formatDashboardNumber(slice.value, locale)} ({formatDashboardNumber(Math.round((slice.value / total) * 100), locale)}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
