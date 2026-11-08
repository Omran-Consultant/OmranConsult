import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { AboutClients } from "@/features/about/components/sections/about-clients";
import { AboutCredentials } from "@/features/about/components/sections/about-credentials";
import { AboutCta } from "@/features/about/components/sections/about-cta";
import { AboutEducationGoals } from "@/features/about/components/sections/about-education-goals";
import { AboutExperts } from "@/features/about/components/sections/about-experts";
import { AboutGovernance } from "@/features/about/components/sections/about-governance";
import { AboutHero } from "@/features/about/components/sections/about-hero";
import { AboutIntro } from "@/features/about/components/sections/about-intro";
import { AboutOrgChart } from "@/features/about/components/sections/about-org-chart";
import { AboutPartners } from "@/features/about/components/sections/about-partners";
import { AboutStrategy } from "@/features/about/components/sections/about-strategy";
import { AboutWorkStages } from "@/features/about/components/sections/about-work-stages";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** About in the brief §6.2 order (design sections plus the ✚ D5 profile sections). */
export async function AboutPageContent({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("Layout");

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={buildBreadcrumbJsonLd(view.locale, [{ name: t("nav.home"), path: "" }, { name: t("nav.about"), path: "/about" }])} />
      <AboutHero view={view} />
      <AboutIntro view={view} />
      <AboutEducationGoals view={view} />
      <AboutStrategy view={view} />
      <AboutGovernance view={view} />
      <AboutWorkStages view={view} />
      <AboutExperts view={view} />
      <AboutOrgChart view={view} />
      <AboutCredentials view={view} />
      <AboutPartners view={view} />
      <AboutClients view={view} />
      <AboutCta view={view} />
    </main>
  );
}
