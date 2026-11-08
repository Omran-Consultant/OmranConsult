import { getTranslations } from "next-intl/server";

import { Container } from "@/core/ui/container";
import { SectionHeader } from "@/core/ui/section-header";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";

/** ✚ D5 (Q11): the profile client list stays on Projects; the logo grid lives on About. */
export async function ProjectsClients({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("ProjectsPage");
  if (view.clientNames.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="projects-clients-title" className="bg-surface py-section-y" data-reveal data-section="clients">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeader title={t("clientsHeading")} titleId="projects-clients-title" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {view.clientNames.map((name) => (
            <li className="flex items-center rounded-md border border-line px-5 py-4 text-body-s text-secondary" key={name}>
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
