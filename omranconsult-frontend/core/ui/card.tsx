import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type CardProps = HTMLAttributes<HTMLElement> & {
  readonly children: ReactNode;
  readonly className?: string;
};

/** Glass card (overlay/glass + border/subtle, radius lg). */
export function Card({ children, className, ...rest }: CardProps) {
  return (
    <article className={classNames("glass rounded-lg border border-line p-6", className)} {...rest}>
      {children}
    </article>
  );
}
