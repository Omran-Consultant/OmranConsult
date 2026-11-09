import { classNames } from "@/core/ui/class-names";

/** Shared chrome for dashboard toolbars (44px). */
export const controlMdClass = classNames(
  "h-[var(--control-md-height)] min-h-[var(--control-md-height)]",
  "rounded-[var(--control-radius)] border border-line bg-elevated",
  "inline-flex items-center justify-center gap-2 px-3 text-body-s text-primary",
  "transition-[border-color,box-shadow] duration-150",
  "focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-none",
);

/** Shared chrome for dashboard form fields (48px). */
export const controlLgClass = classNames(
  "h-[var(--control-lg-height)] min-h-[var(--control-lg-height)]",
  "rounded-[var(--control-radius)] border border-line bg-elevated",
  "w-full px-4 text-body-m text-primary",
  "transition-[border-color,box-shadow] duration-150",
  "placeholder:text-muted",
  "focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-40",
);

export const controlRowClass = "flex flex-wrap items-center gap-2";
