import type { ReactNode } from "react";

import { Icon, type IconName } from "@/core/ui/icon";

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly icon?: IconName;
  readonly action?: ReactNode;
};

/** Spec empty state: icon, message, optional action. */
export function EmptyState({ title, description, icon = "search", action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-strong/16 text-accent">
        <Icon className="size-6" name={icon} weight="duotone" />
      </span>
      <h2 className="font-display text-h4 text-primary">{title}</h2>
      {description ? <p className="max-w-md text-body-s text-secondary">{description}</p> : null}
      {action}
    </div>
  );
}
