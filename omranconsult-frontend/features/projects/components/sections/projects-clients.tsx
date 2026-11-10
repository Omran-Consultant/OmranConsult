import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Container } from "@/core/ui/container";
import { SectionHeader } from "@/core/ui/section-header";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";

/** Clients on Projects: logo tiles aligned with About «عملاؤنا»; name fallback when no logo file exists. */
export async function ProjectsClients({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("ProjectsPage");

  if (view.clients.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="projects-clients-title" className="bg-surface py-section-y" data-reveal data-section="clients">
      <Container className="flex flex-col gap-10 lg:gap-12">
        <SectionHeader title={t("clientsHeading")} titleId="projects-clients-title" />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {view.clients.map((client) => (
            <li className="flex h-24 items-center justify-center rounded-md border border-line bg-white p-4 lg:h-28 dark:bg-elevated" key={client.key}>
              {client.logo ? (
                <Image
                  alt={client.name ?? ""}
                  className="max-h-full w-auto object-contain"
                  height={client.logo.height}
                  sizes="160px"
                  src={client.logo.src}
                  width={client.logo.width}
                />
              ) : (
                <span className="line-clamp-3 text-center text-body-s text-secondary">{client.name}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
