import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type CardProps = HTMLAttributes<HTMLElement> & {
  readonly children: ReactNode;
  readonly className?: string;
};

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <article
      className={classNames("rounded-xl border border-border bg-surface p-6 shadow-card", className)}
      {...rest}
    >
      {children}
    </article>
  );
}
