/**
 * SVG path for a Figma ellipse "arc" (arcData): an annular sector of a circle inscribed in a
 * `size`×`size` box. Angles are in radians, clockwise from 3 o'clock (screen coordinates), as
 * Figma stores them; `innerRadius` is the inner/outer radius ratio.
 */
export function annularSectorPath(size: number, startAngle: number, endAngle: number, innerRadius: number): string {
  const c = size / 2;
  const outer = c;
  const inner = c * innerRadius;
  const point = (radius: number, angle: number) =>
    `${round(c + radius * Math.cos(angle))} ${round(c + radius * Math.sin(angle))}`;
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${point(outer, startAngle)}`,
    `A ${round(outer)} ${round(outer)} 0 ${largeArc} 1 ${point(outer, endAngle)}`,
    `L ${point(inner, endAngle)}`,
    `A ${round(inner)} ${round(inner)} 0 ${largeArc} 0 ${point(inner, startAngle)}`,
    "Z",
  ].join(" ");
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
