import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Container } from "@/core/ui/container";

type SectionTone = "light" | "dark" | "green" | "gradient";

type SectionProps = {
  readonly id?: string;
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly tone?: SectionTone;
  readonly children: ReactNode;
  readonly className?: string;
};

const toneClassName: Record<SectionTone, string> = {
  light: "bg-surface text-foreground",
  dark: "bg-brand-navy-deep text-white",
  green: "bg-brand-green-strong text-white",
  gradient: "bg-brand-gradient text-white",
};

export function Section({
  id,
  eyebrow,
  heading,
  tone = "light",
  children,
  className,
}: SectionProps) {
  return (
    <section className={classNames("py-section-y lg:py-section-y-lg", toneClassName[tone], className)} id={id}>
      <Container className="space-y-6">
        {eyebrow ? (
          <p className="font-display text-sm font-semibold uppercase tracking-wide opacity-90">{eyebrow}</p>
        ) : null}
        {heading ? <h2 className="font-display text-3xl font-semibold md:text-4xl">{heading}</h2> : null}
        {children}
      </Container>
    </section>
  );
}
