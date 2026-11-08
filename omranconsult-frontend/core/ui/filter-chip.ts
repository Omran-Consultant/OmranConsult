import { classNames } from "@/core/ui/class-names";

/** Figma "Filter Chip": 40 high, padding 10/18; the selected chip is inverse (white on navy in dark). */
export function filterChipClassName(selected: boolean, className?: string): string {
  return classNames(
    "inline-flex min-h-10 shrink-0 items-center rounded-full border px-4.5 py-2.5 text-label-s whitespace-nowrap transition-colors duration-150",
    selected ? "border-inverse bg-inverse text-on-inverse" : "border-line-strong text-secondary hover:border-accent hover:text-primary",
    className,
  );
}
