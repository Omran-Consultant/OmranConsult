import type { ReactNode } from "react";

import { AccentText } from "@/core/ui/accent-text";
import { classNames } from "@/core/ui/class-names";
import { Overline } from "@/core/ui/overline";

type SectionHeaderProps = {
  readonly overline?: string;
  /** May contain one `{accent}` word and line breaks. */
  readonly title: string;
  readonly subtitle?: string;
  readonly titleId?: string;
  readonly as?: "h1" | "h2";
  readonly className?: string;
  /** Extra content at the end of the header column (rare). */
  readonly children?: ReactNode;
};

/** Figma "Section Header": width 640, gap 20, Heading/H1 title, Body/L subtitle. */
export function SectionHeader({
  overline,
  title,
  subtitle,
  titleId,
  as: Heading = "h2",
  className,
  children,
}: SectionHeaderProps) {
  return (
    <div className={classNames("flex max-w-160 flex-col gap-5", className)}>
      {overline ? <Overline>{overline}</Overline> : null}
      <Heading className="font-display text-h1 text-primary" id={titleId}>
        <AccentText value={title} />
      </Heading>
      {subtitle ? <p className="text-body-l text-secondary">{subtitle}</p> : null}
      {children}
    </div>
  );
}
