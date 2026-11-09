import { formatDashboardNumber } from "@/features/dashboard/format/format-dashboard-number";
import type { AppLocale } from "@/i18n/routing";

export function BarChart({
  rows,
  locale,
  title,
  color = "currentColor",
}: {
  rows: { id: string; label: string; value: number }[];
  locale: AppLocale;
  title: string;
  color?: string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div>
      <svg aria-label={title} className="h-40 w-full text-accent" role="img" viewBox="0 0 240 80">
        {rows.map((row, index) => {
          const barHeight = (row.value / max) * 70;
          return (
            <rect fill={color} height={barHeight} key={row.id} width="14" x={index * 20} y={80 - barHeight} />
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th>{row.label}</th>
              <td>{formatDashboardNumber(row.value, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
