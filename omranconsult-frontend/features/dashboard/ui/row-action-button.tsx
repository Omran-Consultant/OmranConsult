import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";

export function RowActionButton({
  label,
  onClick,
  children,
  disabled,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      className={classNames(controlMdClass, "w-11 shrink-0 border-0 px-0")}
      data-dashboard-row-action
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}
