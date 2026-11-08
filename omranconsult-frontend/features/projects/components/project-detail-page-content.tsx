import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { ProjectBody } from "@/features/projects/components/sections/project-body";
import { ProjectDetailHero } from "@/features/projects/components/sections/project-detail-hero";
import { ProjectFacts } from "@/features/projects/components/sections/project-facts";
import { ProjectRelated } from "@/features/projects/components/sections/project-related";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";

/** Project Details in the brief §6.5 order. */
export async function ProjectDetailPageContent({ project }: { readonly project: ProjectDetailView }) {
  const layoutT = await getTranslations("Layout");
  const t = await getTranslations("ProjectsPage");
  const title = project.title ?? t("detailFallbackTitle");

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd
        data={buildBreadcrumbJsonLd(project.locale, [
          { name: layoutT("nav.home"), path: "" },
          { name: layoutT("nav.projects"), path: "/projects" },
          { name: title, path: `/projects/${project.slug}` },
        ])}
      />
      <ProjectDetailHero project={project} title={title} />
      <ProjectFacts project={project} />
      <ProjectBody project={project} title={title} />
      <ProjectRelated project={project} />
    </main>
  );
}
