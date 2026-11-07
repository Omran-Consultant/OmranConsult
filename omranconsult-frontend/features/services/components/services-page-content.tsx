import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { PageHeader } from "@/core/ui/page-header";
import { asObject, asString, asStringList } from "@/features/home/lib/block-helpers";
import { ServicesApproachSection } from "@/features/services/components/sections/services-approach-section";
import { ServicesAssetManagementSection } from "@/features/services/components/sections/services-asset-management-section";
import { ServicesAxesSection } from "@/features/services/components/sections/services-axes-section";
import { ServicesEngineeringSection } from "@/features/services/components/sections/services-engineering-section";
import { ServicesOfferingsSection } from "@/features/services/components/sections/services-offerings-section";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type ServicesPageData = Awaited<
  ReturnType<typeof import("@/features/services/services/get-services-page-data").getServicesPageData>
>;

type ServicesPageContentProps = {
  readonly locale: AppLocale;
  readonly data: ServicesPageData;
};

function mapBlockItems(block: Record<string, unknown> | undefined) {
  const raw = block?.items;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return undefined;
      }
      return { title: asString((item as Record<string, unknown>).title) };
    })
    .filter((item): item is { title: string | undefined } => Boolean(item));
}

function joinSlideHeadline(headline?: string, subline?: string): string | undefined {
  const parts = [headline, subline].filter((part): part is string => Boolean(part?.trim()));
  if (parts.length === 0) {
    return undefined;
  }
  return parts.join(" ");
}

export async function ServicesPageContent({ locale, data }: ServicesPageContentProps) {
  const t = await getTranslations("ServicesPage");
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const blocks = data.home.blocks;
  const coreOfferings = asObject(blocks.core_offerings);
  const flexibleModel = asObject(blocks.flexible_model);
  const engineering = asObject(blocks.engineering_design);
  const multiPhase = asObject(blocks.multi_phase_approach);

  const assetCategory = data.services.find((category) => category.kind === "asset_management");
  const engineeringCategory = data.services.find((category) => category.kind === "engineering_design");

  const servicesSlide = slidesByKey.get("services");
  const title = servicesSlide?.headline ?? t("titleFallback");
  const integratedSlide = slidesByKey.get("integrated_solutions");
  const assetSlide = slidesByKey.get("asset_management");
  const engineeringSlide = slidesByKey.get("engineering");
  const approachSlide = slidesByKey.get("approach");

  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: title, path: "/services" },
  ]);

  const coreItems = mapBlockItems(coreOfferings);
  const flexibleItems = mapBlockItems(flexibleModel);
  const steps = asStringList(multiPhase?.steps);
  const outputs = asStringList(multiPhase?.outputs);

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />
      <div data-section="header">
        <PageHeader
          description={servicesSlide?.subline}
          image={SECTION_BACKGROUND_IMAGES.services}
          locale={locale}
          title={title}
        />
      </div>

      <ServicesAxesSection
        categories={data.services}
        heading={joinSlideHeadline(integratedSlide?.headline, integratedSlide?.subline)}
        locale={locale}
      />

      {assetCategory ? (
        <ServicesAssetManagementSection
          description={assetSlide?.subline}
          heading={assetSlide?.headline ?? assetCategory.title}
          services={assetCategory.services}
        />
      ) : null}

      <ServicesOfferingsSection
        coreItems={coreItems}
        coreTitle={asString(coreOfferings?.section_title)}
        flexibleItems={flexibleItems}
        flexibleTitle={asString(flexibleModel?.section_title)}
        locale={locale}
      />

      {engineeringCategory ? (
        <ServicesEngineeringSection
          body={asString(engineering?.body)}
          disciplines={engineeringCategory.services}
          heading={asString(engineering?.section_title) ?? engineeringSlide?.headline}
        />
      ) : null}

      <ServicesApproachSection
        heading={asString(multiPhase?.section_title) ?? approachSlide?.headline}
        outputs={outputs}
        steps={steps}
      />
    </main>
  );
}
