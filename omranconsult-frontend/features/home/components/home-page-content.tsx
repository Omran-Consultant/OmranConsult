import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { JsonLd } from "@/core/seo/json-ld";
import { HomeAbout } from "@/features/home/components/sections/home-about";
import { HomeCoverage } from "@/features/home/components/sections/home-coverage";
import { HomeCta } from "@/features/home/components/sections/home-cta";
import { HomeHero } from "@/features/home/components/sections/home-hero";
import { HomeProjects } from "@/features/home/components/sections/home-projects";
import { HomeServices } from "@/features/home/components/sections/home-services";
import { HomeStats } from "@/features/home/components/sections/home-stats";
import { HomeTrust } from "@/features/home/components/sections/home-trust";
import type { HomeView } from "@/features/home/services/home-view";

/** Home in the Figma section order (PHASE4C §6.1). */
export function HomePageContent({ view }: { readonly view: HomeView }) {
  const siteOrigin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: view.organization.name,
          url: `${siteOrigin}/${view.locale}`,
          email: view.organization.email,
          telephone: view.organization.telephone,
        }}
      />
      <HomeHero view={view} />
      <HomeStats view={view} />
      <HomeAbout view={view} />
      <HomeServices view={view} />
      <HomeProjects view={view} />
      <HomeCoverage view={view} />
      <HomeTrust view={view} />
      <HomeCta view={view} />
    </main>
  );
}
