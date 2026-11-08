import { getTranslations } from "next-intl/server";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { ProjectsClients } from "@/features/projects/components/sections/projects-clients";
import { ProjectsFilterBar } from "@/features/projects/components/sections/projects-filter-bar";
import { ProjectsGrid } from "@/features/projects/components/sections/projects-grid";
import { ProjectsHero } from "@/features/projects/components/sections/projects-hero";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";

/** Projects in the brief §6.4 order, plus the ✚ D5 client list. */
export async function ProjectsPageContent({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("Layout");

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={buildBreadcrumbJsonLd(view.locale, [{ name: t("nav.home"), path: "" }, { name: t("nav.projects"), path: "/projects" }])} />
      <ProjectsHero view={view} />
      <ProjectsFilterBar view={view} />
      <ProjectsGrid view={view} />
      <ProjectsClients view={view} />
    </main>
  );
}
