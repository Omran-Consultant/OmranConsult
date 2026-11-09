import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { controlRowClass } from "@/features/dashboard/ui/control-styles";

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={classNames(controlRowClass, className)} data-dashboard-filter>
      {children}
    </div>
  );
}
