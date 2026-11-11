import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { JsonLd } from "@/core/seo/json-ld";
import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
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
  const layout = await getLayoutData(locale);
  const siteOrigin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-primary">
      {/* Site-wide Organization (P4b); company facts come from the API settings. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: layout.companyName,
          url: `${siteOrigin}/${locale}`,
          logo: `${siteOrigin}/images/brand/logo-dark.svg`,
          email: layout.email,
          telephone: layout.phones[0],
        }}
      />
      <SiteHeader email={layout.email} />
      <div className="flex flex-1 flex-col" id="main-content" tabIndex={-1}>
        {children}
      </div>
      <SiteFooter />
      <RevealObserver />
    </div>
  );
}
