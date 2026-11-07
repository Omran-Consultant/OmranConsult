import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type ContainerProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={classNames("mx-auto w-full max-w-7xl px-4", className)}>{children}</div>;
}
