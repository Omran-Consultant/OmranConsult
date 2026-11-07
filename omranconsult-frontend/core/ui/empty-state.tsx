import type { ReactNode } from "react";

import { Card } from "@/core/ui/card";

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center">
      <h2 className="font-display text-xl font-semibold text-heading">{title}</h2>
      {description ? <p className="mt-2 text-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
