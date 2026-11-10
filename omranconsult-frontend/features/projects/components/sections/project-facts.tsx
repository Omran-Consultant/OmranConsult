import { getTranslations } from "next-intl/server";

import { Container } from "@/core/ui/container";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";

/**
 * Figma "Facts Bar": up to five facts sharing the bar evenly (caption label, H4 value) with start borders; the 390 frame
 * stacks them as label/value rows. Each fact is hidden when the API has no value (§6.5).
 */
export async function ProjectFacts({ project }: { readonly project: ProjectDetailView }) {
  const t = await getTranslations("ProjectsPage");
  const status = project.deliveryStatus === "completed" ? t("statusCompleted") : project.deliveryStatus === "ongoing" ? t("statusOngoing") : undefined;
  const facts = [
    { key: "client", label: t("factClient"), value: project.client?.name },
    { key: "location", label: t("factLocation"), value: project.location ?? (project.regions.join(project.locale === "ar" ? "، " : ", ") || undefined) },
    { key: "service-type", label: t("factServiceType"), value: project.serviceType },
    { key: "sector", label: t("factSector"), value: project.sector?.name },
    { key: "status", label: t("factStatus"), value: status },
  ].filter((fact): fact is { key: string; label: string; value: string } => Boolean(fact.value));

  if (facts.length === 0) {
    return null;
  }

  return (
    <section aria-label={t("factsLabel")} className="bg-surface" data-section="facts-bar">
      <Container>
        <dl className="py-2 md:flex md:py-0">
          {facts.map((fact) => (
            <div
              className="flex items-center justify-between gap-4 border-b border-line py-3.5 md:min-w-0 md:flex-1 md:flex-col md:items-start md:justify-start md:gap-2 md:border-b-0 md:px-4 md:py-8 md:not-first:border-s lg:px-6"
              key={fact.key}
            >
              <dt className="shrink-0 text-body-s text-muted md:text-caption">{fact.label}</dt>
              <dd className="text-end text-label-m text-primary md:text-start md:font-display md:text-h4">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
