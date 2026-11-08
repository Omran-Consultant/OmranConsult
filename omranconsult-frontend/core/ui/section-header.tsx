import type { ReactNode } from "react";

import { AccentText } from "@/core/ui/accent-text";
import { classNames } from "@/core/ui/class-names";
import { Overline } from "@/core/ui/overline";

type SectionHeaderProps = {
  readonly overline?: string;
  /** Shorter overline below 768 px (the 390 frames). */
  readonly overlineShort?: string;
  /** May contain one `{accent}` word and line breaks. */
  readonly title: string;
  /** Shorter title below 768 px (the 390 frames); one heading element keeps the id. */
  readonly titleShort?: string;
  readonly subtitle?: string;
  /** Shorter subtitle below 768 px (the 390 frames). */
  readonly subtitleShort?: string;
  readonly titleId?: string;
  readonly as?: "h1" | "h2";
  readonly className?: string;
  readonly titleClassName?: string;
  /** Extra content at the end of the header column (rare). */
  readonly children?: ReactNode;
};

/** Figma "Section Header": width 640, gap 20, Heading/H1 title, Body/L subtitle. */
export function SectionHeader({
  overline,
  overlineShort,
  title,
  titleShort,
  subtitle,
  subtitleShort,
  titleId,
  as: Heading = "h2",
  className,
  titleClassName,
  children,
}: SectionHeaderProps) {
  return (
    <div className={classNames("flex max-w-160 flex-col gap-5", className)}>
      {overline ? <Overline className={overlineShort ? "max-md:hidden" : undefined}>{overline}</Overline> : null}
      {overline && overlineShort ? <Overline className="md:hidden">{overlineShort}</Overline> : null}
      <Heading className={classNames("font-display text-h1 text-primary", titleClassName)} id={titleId}>
        {titleShort ? (
          <>
            <span className="max-md:hidden">
              <AccentText value={title} />
            </span>
            <span className="md:hidden">
              <AccentText value={titleShort} />
            </span>
          </>
        ) : (
          <AccentText value={title} />
        )}
      </Heading>
      {subtitle ? <p className={classNames("text-body-l text-secondary", subtitleShort && "max-md:hidden")}>{subtitle}</p> : null}
      {subtitle && subtitleShort ? <p className="text-body-l text-secondary md:hidden">{subtitleShort}</p> : null}
      {children}
    </div>
  );
}
