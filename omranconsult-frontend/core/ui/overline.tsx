import { classNames } from "@/core/ui/class-names";

type OverlineProps = {
  readonly children: string;
  readonly className?: string;
};

/**
 * Latin overline ("01 — NAME"). The 40×2 accent rule leads the Latin text, so it sits on its left
 * in both directions (Figma auto layout: rule, then text); the block keeps the page alignment.
 */
export function Overline({ children, className }: OverlineProps) {
  return (
    <p className={classNames("flex w-fit items-center gap-3 text-accent", className)} dir="ltr">
      <span aria-hidden="true" className="h-0.5 w-10 shrink-0 rounded-full bg-accent" />
      <span className="font-latin text-overline uppercase">{children}</span>
    </p>
  );
}
