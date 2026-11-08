import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type CertificateCardProps = {
  /** Latin code or name, for example "ISO 9001". */
  readonly code?: string;
  readonly label?: string;
  readonly badge?: ReactNode;
  readonly className?: string;
};

/** Figma Trust "Cert" card: glass, radius lg, seal ring, Latin code, caption label. */
export function CertificateCard({ code, label, badge, className }: CertificateCardProps) {
  return (
    <div className={classNames("glass flex h-full flex-col items-center gap-2 rounded-lg border border-line px-4 py-7 text-center", className)}>
      <span aria-hidden="true" className="mb-1 size-11 rounded-full border-[1.5px] border-accent" />
      {code ? (
        <span className="font-latin text-base font-bold text-primary" dir="ltr">
          {code}
        </span>
      ) : null}
      {label ? <span className={classNames(code ? "text-caption text-muted" : "font-display text-h4 text-primary")}>{label}</span> : null}
      {badge}
    </div>
  );
}
