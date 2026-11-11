import { classNames } from "@/core/ui/class-names";

/**
 * Filter / category chip. One height with the rest of the filter bar: 48px desktop, 44px at ≤767.
 * Selected chip is inverse (white on navy in dark).
 */
export function filterChipClassName(selected: boolean, className?: string): string {
  return classNames(
    "inline-flex h-11 shrink-0 items-center rounded-full border px-4.5 text-label-s whitespace-nowrap transition-colors duration-150 md:h-12",
    selected ? "border-inverse bg-inverse text-on-inverse" : "border-line-strong text-secondary hover:border-accent hover:text-primary",
    className,
  );
}
