import { getTranslations } from "next-intl/server";

import { Card } from "@/core/ui/card";
import { PageHeader } from "@/core/ui/page-header";
import { Section } from "@/core/ui/section";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type ServicesPageData = Awaited<
  ReturnType<typeof import("@/features/services/services/get-services-page-data").getServicesPageData>
>;

type ServicesPageContentProps = {
  readonly locale: AppLocale;
  readonly data: ServicesPageData;
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export async function ServicesPageContent({ locale, data }: ServicesPageContentProps) {
  const t = await getTranslations("ServicesPage");
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const blocks = data.home.blocks;
  const coreOfferings = asObject(blocks.core_offerings);
  const flexibleModel = asObject(blocks.flexible_model);
  const engineering = asObject(blocks.engineering_design);
  const multiPhase = asObject(blocks.multi_phase_approach);

  const axisCategories = data.services.filter((category) => category.kind === "axis");
  const assetCategory = data.services.find((category) => category.kind === "asset_management");
  const engineeringCategory = data.services.find((category) => category.kind === "engineering_design");

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        description={slidesByKey.get("services")?.subline}
        image={SECTION_BACKGROUND_IMAGES.services}
        locale={locale}
        title={slidesByKey.get("services")?.headline ?? t("titleFallback")}
      />

      <Section heading={t("axesHeading")}>
        <div className="grid gap-6 md:grid-cols-3">
          {axisCategories.map((category) => (
            <Card key={category.slug}>
              <h2 className="font-display text-xl font-semibold text-heading">{category.title}</h2>
              <ul className="mt-3 space-y-2 text-muted">
                {category.services.map((service) => (
                  <li key={service.slug}>- {service.title}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section heading={asString(coreOfferings?.section_title)}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <h3 className="font-display text-xl font-semibold text-heading">{asString(coreOfferings?.section_title)}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {(coreOfferings?.items as Array<Record<string, unknown>> | undefined)?.map((item, index) => (
                <li key={index}>- {asString(item.title)}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="font-display text-xl font-semibold text-heading">{asString(flexibleModel?.section_title)}</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {(flexibleModel?.items as Array<Record<string, unknown>> | undefined)?.map((item, index) => (
                <li key={index}>- {asString(item.title)}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section heading={slidesByKey.get("asset_management")?.headline}>
        <Card>
          <h3 className="font-display text-xl font-semibold text-heading">{assetCategory?.title}</h3>
          <ul className="mt-3 grid gap-2 text-muted md:grid-cols-2">
            {assetCategory?.services.map((service) => (
              <li key={service.slug}>- {service.title}</li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section heading={slidesByKey.get("engineering")?.headline}>
        <Card>
          <h3 className="font-display text-xl font-semibold text-heading">{engineeringCategory?.title}</h3>
          <p className="mt-2 text-muted">{asString(engineering?.body)}</p>
          <ul className="mt-3 grid gap-2 text-muted md:grid-cols-2">
            {engineeringCategory?.services.map((service) => (
              <li key={service.slug}>- {service.title}</li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section heading={asString(multiPhase?.section_title)} tone="dark">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/5 text-white">
            <h3 className="font-display text-xl font-semibold">{t("stepsHeading")}</h3>
            <ol className="mt-3 space-y-2 text-muted-on-dark">
              {asStringList(multiPhase?.steps).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Card>
          <Card className="bg-white/5 text-white">
            <h3 className="font-display text-xl font-semibold">{t("outputsHeading")}</h3>
            <ul className="mt-3 space-y-2 text-muted-on-dark">
              {asStringList(multiPhase?.outputs).map((output) => (
                <li key={output}>- {output}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>
    </main>
  );
}
