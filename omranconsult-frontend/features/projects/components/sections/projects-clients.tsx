import { getTranslations } from "next-intl/server";

import { Container } from "@/core/ui/container";
import { LogoTileGrid } from "@/core/ui/logo-tile-grid";
import { SectionHeader } from "@/core/ui/section-header";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";

/** Clients on Projects: the same logo tiles as About «عملاؤنا»; name fallback when no logo file exists. */
export async function ProjectsClients({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("ProjectsPage");
  const layout = await getTranslations("Layout");

  if (view.clients.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="projects-clients-title" className="bg-surface py-section-y" data-reveal data-section="clients">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeader title={t("clientsHeading")} titleId="projects-clients-title" />
        <LogoTileGrid fallbackAlt={layout("brand.clientLogoAlt")} tiles={view.clients} />
      </Container>
    </section>
  );
}
