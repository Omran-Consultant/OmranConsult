import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon, type IconName } from "@/core/ui/icon";
import { Link } from "@/i18n/navigation";

type CardFrameProps = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly featured?: boolean;
  readonly href?: string;
};

/**
 * Shared service-card shell (A36, service-cards-concept): radius lg, subtle border,
 * two-layer navy shadow, 6 px lift and gradient hairline on hover. Motion is off
 * under prefers-reduced-motion; phones get a pressed border instead of the lift.
 */
export function CardFrame({ children, className, featured = false, href }: CardFrameProps) {
  const classNamesValue = classNames(
    "group relative isolate flex flex-col overflow-hidden rounded-lg border border-line bg-surface text-primary shadow-card",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "motion-safe:transition-[transform,box-shadow] motion-safe:duration-[250ms] motion-safe:ease-out",
    "motion-safe:md:hover:-translate-y-1.5 motion-safe:md:hover:shadow-card-hover",
    "motion-safe:md:focus-visible:-translate-y-1.5 motion-safe:md:focus-visible:shadow-card-hover",
    "max-md:active:border-line-accent",
    "dark:[background-color:var(--overlay-glass)]",
    featured &&
      "border-transparent bg-[linear-gradient(160deg,var(--navy-900),var(--navy-800))] text-white dark:bg-[linear-gradient(160deg,var(--navy-900),var(--navy-800))]",
    className,
  );
  const body = (
    <>
      <span
        aria-hidden="true"
        className={classNames(
          "pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 [mask-composite:exclude] [-webkit-mask-composite:xor] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
          featured
            ? "opacity-100 [background:linear-gradient(135deg,color-mix(in_srgb,var(--green-300)_70%,transparent),transparent_45%)]"
            : "motion-safe:transition-opacity motion-safe:duration-[250ms] motion-safe:md:group-hover:opacity-100 motion-safe:md:group-focus-visible:opacity-100 max-md:group-active:opacity-100 [background:linear-gradient(135deg,var(--green-600),color-mix(in_srgb,var(--navy-800)_25%,transparent)_60%)]",
        )}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden opacity-0 motion-safe:md:block motion-safe:md:group-hover:opacity-100 motion-safe:md:group-focus-visible:opacity-100 [background:radial-gradient(280px_circle_at_70%_30%,color-mix(in_srgb,var(--green-300)_10%,transparent),transparent_60%)]"
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </>
  );

  if (href) {
    return (
      <Link className={classNamesValue} href={href}>
        {body}
      </Link>
    );
  }

  return <article className={classNamesValue}>{body}</article>;
}

type IconTileProps = {
  readonly name: IconName;
  readonly featured?: boolean;
  readonly compact?: boolean;
};

/** Soft tinted square. Duotone glyph; hover fills the tile with accessible green. */
export function IconTile({ name, featured = false, compact = false }: IconTileProps) {
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center justify-center rounded-[14px] transition-colors duration-[250ms] ease-out",
        "md:group-hover:bg-green-700 md:group-hover:text-white md:group-focus-visible:bg-green-700 md:group-focus-visible:text-white",
        "max-md:group-active:bg-green-700 max-md:group-active:text-white",
        featured ? "bg-green-300/16 text-green-300" : "bg-accent-strong/12 text-accent dark:bg-green-300/16 dark:text-green-300",
        compact ? "size-11" : "size-14",
      )}
    >
      <Icon className={compact ? "size-5" : "size-6.5"} name={name} weight="duotone" />
    </span>
  );
}

type NumeralProps = {
  readonly value: string;
  readonly featured?: boolean;
  readonly compact?: boolean;
};

/** Outlined Montserrat watermark at the top end. Hidden from assistive tech. */
export function Numeral({ value, featured = false, compact = false }: NumeralProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "pointer-events-none absolute top-2.5 end-5 font-latin leading-none font-extrabold text-transparent",
        compact ? "text-[2.5rem]" : "text-[4rem] md:text-[5.75rem]",
        featured
          ? "[-webkit-text-stroke:1.5px_color-mix(in_srgb,white_12%,transparent)]"
          : "[-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--text-primary)_9%,transparent)]",
      )}
    >
      {value}
    </span>
  );
}

type ArrowDiscProps = {
  readonly featured?: boolean;
};

/** 38 px circular arrow. Featured starts filled; hover fills the outline. */
export function ArrowDisc({ featured = false }: ArrowDiscProps) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "inline-flex size-9.5 items-center justify-center rounded-full transition-colors duration-[250ms] ease-out",
        "md:group-hover:border-green-700 md:group-hover:bg-green-700 md:group-hover:text-white",
        "md:group-focus-visible:border-green-700 md:group-focus-visible:bg-green-700 md:group-focus-visible:text-white",
        "max-md:group-active:border-green-700 max-md:group-active:bg-green-700 max-md:group-active:text-white",
        featured ? "border-transparent bg-green-700 text-white" : "border border-accent-strong/25 text-accent",
      )}
    >
      <Icon className="size-4.5" name="arrow" />
    </span>
  );
}
