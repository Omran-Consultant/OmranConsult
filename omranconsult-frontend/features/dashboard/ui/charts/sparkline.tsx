export function Sparkline({ values, color = "#1B5FA8" }: { values: number[]; color?: string }) {
  if (values.length === 0) {
    return null;
  }
  const max = Math.max(1, ...values);
  const width = 200;
  const height = 28;
  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = height - (value / max) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg aria-hidden className="h-7 w-full" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" points={points} stroke={color} strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
