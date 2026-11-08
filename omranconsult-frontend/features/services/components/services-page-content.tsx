import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { ServicesApproach } from "@/features/services/components/sections/services-approach";
import { ServicesAssetManagement } from "@/features/services/components/sections/services-asset-management";
import { ServicesCta } from "@/features/services/components/sections/services-cta";
import { ServicesEngineering } from "@/features/services/components/sections/services-engineering";
import { ServicesHero } from "@/features/services/components/sections/services-hero";
import { ServicesOfferings } from "@/features/services/components/sections/services-offerings";
import { ServicesPillars } from "@/features/services/components/sections/services-pillars";
import { ServicesTools } from "@/features/services/components/sections/services-tools";
import type { ServicesView } from "@/features/services/services/get-services-page-data";

/** Services in the brief §6.3 order (design sections plus the ✚ D5 offerings). */
export async function ServicesPageContent({ view }: { readonly view: ServicesView }) {
  const t = await getTranslations("Layout");

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={buildBreadcrumbJsonLd(view.locale, [{ name: t("nav.home"), path: "" }, { name: t("nav.services"), path: "/services" }])} />
      <ServicesHero view={view} />
      <ServicesPillars view={view} />
      <ServicesAssetManagement view={view} />
      <ServicesEngineering view={view} />
      <ServicesApproach view={view} />
      <ServicesOfferings view={view} />
      <ServicesTools view={view} />
      <ServicesCta view={view} />
    </main>
  );
}
