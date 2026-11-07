import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";

type ContainerProps = {
  readonly children: ReactNode;
  readonly className?: string;
};

/** 1280 px container with the responsive side margins (DESIGN_BASELINE §4). */
export function Container({ children, className }: ContainerProps) {
  return <div className={classNames("container-page", className)}>{children}</div>;
}
