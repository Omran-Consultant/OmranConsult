import type { ReactNode } from "react";

import { SiteFooter } from "@/features/layout/components/site-footer";
import { SiteHeader } from "@/features/layout/components/site-header";
import { SiteHeaderTopBar } from "@/features/layout/components/site-header-top-bar";

type PublicLayoutShellProps = {
  children: ReactNode;
};

export function PublicLayoutShell({ children }: PublicLayoutShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-foreground dark:bg-brand-navy-deep dark:text-foreground">
      <SiteHeaderTopBar />
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </div>
  );
}
