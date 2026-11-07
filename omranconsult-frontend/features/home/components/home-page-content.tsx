import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { JsonLd } from "@/core/seo/json-ld";
import { HomeAboutSection } from "@/features/home/components/sections/home-about-section";
import { HomeContactSection } from "@/features/home/components/sections/home-contact-section";
import { HomeCredentialsSection } from "@/features/home/components/sections/home-credentials-section";
import { HomeExpertsSection } from "@/features/home/components/sections/home-experts-section";
import { HomeHeroSection } from "@/features/home/components/sections/home-hero-section";
import { HomeProjectsSection } from "@/features/home/components/sections/home-projects-section";
import { HomeServicesSection } from "@/features/home/components/sections/home-services-section";
import { HomeStatsSection } from "@/features/home/components/sections/home-stats-section";
import { HomeStrategySection } from "@/features/home/components/sections/home-strategy-section";
import { asObject, asString } from "@/features/home/lib/block-helpers";
import type { HomePageData } from "@/features/home/types/home-page-data";
import type { AppLocale } from "@/i18n/routing";

type HomePageContentProps = {
  readonly locale: AppLocale;
  readonly data: HomePageData;
};

export async function HomePageContent({ locale, data }: HomePageContentProps) {
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const blocks = data.home.blocks;
  const aboutBlock = blocks.about;
  const strategyBlock = blocks.strategy;
  const sectionTitles = asObject(blocks.section_titles);
  const siteOrigin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";
  const coverSlide = slidesByKey.get("cover");
  const heroSlide = slidesByKey.get("hero");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.settings.companyLegalName ?? coverSlide?.headline,
    url: `${siteOrigin}/${locale}`,
    email: data.settings.contact.email,
    telephone: data.settings.contact.phones[0],
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={organizationJsonLd} />

      <HomeHeroSection coverSlide={coverSlide} heroSlide={heroSlide} locale={locale} />

      <HomeStatsSection
        heading={asString(sectionTitles?.statistics)}
        locale={locale}
        statistics={data.home.statistics}
      />

      <HomeAboutSection
        aboutBlock={aboutBlock}
        locale={locale}
        settingsAddress={data.settings.contact.address}
      />

      <HomeStrategySection sectionHeading={slidesByKey.get("vision")?.headline} strategyBlock={strategyBlock} />

      <HomeServicesSection
        categories={data.services}
        heading={slidesByKey.get("services")?.headline}
        locale={locale}
      />

      <HomeProjectsSection
        clients={data.clients}
        heading={slidesByKey.get("projects")?.headline ?? asString(sectionTitles?.featured_projects)}
        locale={locale}
        projects={data.projects.projects}
        regions={data.regions}
      />

      <HomeCredentialsSection
        blocks={blocks}
        clients={data.clients}
        documents={data.documents}
        locale={locale}
        partners={data.partners}
      />

      <HomeExpertsSection blocks={blocks} experts={data.experts} locale={locale} />

      <HomeContactSection locale={locale} settings={data.settings} />
    </main>
  );
}
