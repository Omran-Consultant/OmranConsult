import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { RevealObserver } from "@/core/ui/reveal-observer";
import { SiteFooter } from "@/features/layout/components/site-footer";
import { SiteHeader } from "@/features/layout/components/site-header";
import { getLayoutData } from "@/features/layout/services/get-layout-data";
import type { AppLocale } from "@/i18n/routing";

type PublicLayoutShellProps = {
  children: ReactNode;
};

export async function PublicLayoutShell({ children }: PublicLayoutShellProps) {
  const locale = (await getLocale()) as AppLocale;
  const { email } = await getLayoutData(locale);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-primary">
      <SiteHeader email={email} />
      <div className="flex flex-1 flex-col" id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
      <RevealObserver />
    </div>
  );
}
