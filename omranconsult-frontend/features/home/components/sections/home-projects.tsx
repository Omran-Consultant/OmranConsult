import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { SectionHeader } from "@/core/ui/section-header";
import { ProjectsShowcase } from "@/features/home/components/projects-showcase";
import type { HomeView } from "@/features/home/services/home-view";

/** Figma Home "Projects": header, sector chips, bento of six, «عرض جميع المشاريع». */
export async function HomeProjects({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { projects: copy } = view.copy;
  const titleId = "home-projects-title";

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-6 bg-canvas py-16 lg:gap-16 lg:py-35" data-section="projects">
      <ProjectsShowcase
        header={copy.title ? <SectionHeader className="max-lg:[&_p:last-child]:hidden" overline={copy.overline} subtitle={copy.subtitle} title={copy.title} titleId={titleId} /> : null}
        projects={view.projects}
        sectors={view.sectors}
        titleId={titleId}
      />
      <div className="container-page hidden justify-center md:flex">
        <LinkButton arrow href="/projects" variant="light">
          {t("allProjects")}
        </LinkButton>
      </div>
    </section>
  );
}
