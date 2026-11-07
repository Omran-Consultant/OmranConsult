import { classNames } from "@/core/ui/class-names";

type OverlineProps = {
  readonly children: string;
  readonly className?: string;
};

/** Latin overline ("01 — NAME") with the 40×2 accent rule at the reading start. */
export function Overline({ children, className }: OverlineProps) {
  return (
    <p className={classNames("flex items-center gap-3 text-accent", className)}>
      <span aria-hidden="true" className="h-0.5 w-10 shrink-0 rounded-full bg-accent" />
      <span className="font-latin text-overline uppercase" dir="ltr">
        {children}
      </span>
    </p>
  );
}
