import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/core/ui/page-header";
import { Section } from "@/core/ui/section";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type ProjectDetailData = Awaited<
  ReturnType<typeof import("@/features/projects/services/get-project-detail-data").getProjectDetailData>
>;

type ProjectDetailPageContentProps = {
  readonly locale: AppLocale;
  readonly project: NonNullable<ProjectDetailData>;
};

export async function ProjectDetailPageContent({
  locale,
  project,
}: ProjectDetailPageContentProps) {
  const t = await getTranslations("ProjectsPage");

  return (
    <main className="flex flex-1 flex-col">
      <PageHeader
        image={SECTION_BACKGROUND_IMAGES.featured_projects}
        locale={locale}
        title={project.title ?? t("detailFallbackTitle")}
      />

      <Section heading={t("detailInfoHeading")}>
        {project.client?.name && project.client.slug ? (
          <p className="text-muted">
            {t("ownerLabel")}{" "}
            <Link
              className="font-semibold text-brand-green-strong"
              href={`/projects?${new URLSearchParams({ client: project.client.slug }).toString()}`}
            >
              {project.client.name}
            </Link>
          </p>
        ) : null}

        {project.regions.length > 0 ? (
          <p className="text-muted">
            {t("regionsLabel")} {project.regions.map((region) => region.name ?? region.slug).join(" - ")}
          </p>
        ) : null}

        <Link className="inline-flex text-sm font-semibold text-brand-green-strong" href="/projects">
          {t("backToProjects")}
        </Link>
      </Section>
    </main>
  );
}
