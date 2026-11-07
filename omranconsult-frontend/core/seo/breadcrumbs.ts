import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import type { AppLocale } from "@/i18n/routing";

type BreadcrumbItem = {
  readonly name: string;
  readonly path: string;
};

export function buildBreadcrumbJsonLd(locale: AppLocale, items: BreadcrumbItem[]) {
  const siteOrigin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteOrigin}/${locale}${item.path}`,
    })),
  };
}
