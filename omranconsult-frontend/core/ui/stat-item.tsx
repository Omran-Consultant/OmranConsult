import { classNames } from "@/core/ui/class-names";
import { CountUp } from "@/core/ui/count-up";

type StatItemProps = {
  readonly value: string;
  readonly label?: string;
  /** Shorter label below 768 px (the 390 frames). */
  readonly shortLabel?: string;
  /** The first item of a row is accent-coloured (spec). */
  readonly accent?: boolean;
  readonly className?: string;
};

/** Figma "Stat Item": 1 px top border, padding-top 28, gap 12, Number/L + Body/S. */
export function StatItem({ value, label, shortLabel, accent = false, className }: StatItemProps) {
  return (
    <div className={classNames("flex flex-col gap-3 border-t border-line pt-7", className)}>
      <CountUp className={classNames("font-display text-number-l", accent ? "text-accent" : "text-primary")} value={value} />
      {label ? <p className={classNames("text-body-s text-secondary", shortLabel && "max-md:hidden")}>{label}</p> : null}
      {shortLabel ? <p className="text-body-s text-secondary md:hidden">{shortLabel}</p> : null}
    </div>
  );
}
