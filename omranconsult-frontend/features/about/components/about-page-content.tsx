import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { AboutAboutSection } from "@/features/about/components/sections/about-about-section";
import { AboutCredentialsSection } from "@/features/about/components/sections/about-credentials-section";
import { AboutEducationGoalsSection } from "@/features/about/components/sections/about-education-goals-section";
import { AboutEsgSection } from "@/features/about/components/sections/about-esg-section";
import { AboutExpertsSection } from "@/features/about/components/sections/about-experts-section";
import { AboutHeaderSection } from "@/features/about/components/sections/about-header-section";
import { AboutOrgChartSection } from "@/features/about/components/sections/about-org-chart-section";
import { AboutPartnersSection } from "@/features/about/components/sections/about-partners-section";
import { AboutStrategySection } from "@/features/about/components/sections/about-strategy-section";
import { AboutToolsSection } from "@/features/about/components/sections/about-tools-section";
import { AboutWorkStagesSection } from "@/features/about/components/sections/about-work-stages-section";
import { asObject, asString } from "@/features/home/lib/block-helpers";
import type { AppLocale } from "@/i18n/routing";

type AboutPageData = Awaited<
  ReturnType<typeof import("@/features/about/services/get-about-page-data").getAboutPageData>
>;

type AboutPageContentProps = {
  readonly locale: AppLocale;
  readonly data: AboutPageData;
};

export async function AboutPageContent({ locale, data }: AboutPageContentProps) {
  const t = await getTranslations("AboutPage");
  const blocks = data.home.blocks;
  const aboutBlock = blocks.about;
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const pageTitle = asString(asObject(aboutBlock)?.heading) ?? t("titleFallback");
  const aboutSlideSubline = slidesByKey.get("integrated_solutions")?.subline;
  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: pageTitle, path: "/about" },
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />

      <AboutHeaderSection locale={locale} subline={aboutSlideSubline} title={pageTitle} />

      <AboutAboutSection
        aboutBlock={aboutBlock}
        locale={locale}
        settingsAddress={data.settings.contact.address}
      />

      <AboutEducationGoalsSection educationGoalsBlock={blocks.education_goals} locale={locale} />

      <AboutStrategySection
        sectionHeading={slidesByKey.get("vision")?.headline}
        strategyBlock={blocks.strategy}
      />

      <AboutWorkStagesSection
        locale={locale}
        multiPhaseBlock={blocks.multi_phase_approach}
        workStagesBlock={blocks.work_stages}
      />

      <AboutEsgSection esgBlock={blocks.esg} />

      <AboutToolsSection toolsBlock={blocks.tools} />

      <AboutExpertsSection blocks={blocks} experts={data.experts} locale={locale} />

      <AboutOrgChartSection blocks={blocks} orgChart={data.orgChart} />

      <AboutCredentialsSection blocks={blocks} documents={data.documents} locale={locale} />

      <AboutPartnersSection locale={locale} partners={data.partners} />
    </main>
  );
}
