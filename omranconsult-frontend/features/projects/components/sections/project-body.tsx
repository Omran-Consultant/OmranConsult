import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/core/ui/button";
import { Container } from "@/core/ui/container";
import { Icon } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import { ProjectGallery } from "@/features/projects/components/project-gallery";
import { ProjectInquiryCard } from "@/features/projects/components/project-inquiry-card";
import { ProjectOverview } from "@/features/projects/components/project-overview";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";
import { Link } from "@/i18n/navigation";

function ClientProjectsLink({ slug, label }: { readonly slug: string; readonly label: string }) {
  return (
    <Link className={buttonClassName("ghost")} href={`/projects?client=${encodeURIComponent(slug)}`}>
      <span>{label}</span>
      <Icon className="text-accent" name="arrow" />
    </Link>
  );
}

/**
 * Figma "Body": overview, scope and gallery (800 wide) beside the sticky 400-px inquiry card;
 * below 1024 px the card follows the content. Every part appears only with its data; without an
 * overview the owner block takes its place (§6.5 edge case).
 */
export async function ProjectBody({ project, title }: { readonly project: ProjectDetailView; readonly title: string }) {
  const t = await getTranslations("ProjectsPage");
  const { copy, client } = project;
  const hasOverview = Boolean(project.overview) || project.overviewBlocks.length > 0;

  return (
    <section className="py-10 lg:py-30" data-section="body">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-20">
        <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
          <div className="flex flex-col gap-5">
            <SectionHeader className="lg:max-w-none" overline={copy.overview_overline} subtitle={project.overview ?? undefined} title={copy.overview_title ?? title} />
            {!project.overview && project.overviewBlocks.length > 0 ? <ProjectOverview blocks={project.overviewBlocks} /> : null}
            {hasOverview ? null : (
              <div className="flex flex-col items-start gap-5 rounded-[20px] border border-line bg-surface p-6 lg:p-8" data-section-part="owner">
                <dl className="flex flex-col gap-3 text-body-l">
                  {client ? (
                    <div className="flex flex-col gap-1">
                      <dt className="text-body-s text-muted">{t("ownerLabel")}</dt>
                      <dd className="font-display text-h3 text-primary">{client.name}</dd>
                    </div>
                  ) : null}
                  {project.regions.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      <dt className="text-body-s text-muted">{t("regionsLabel")}</dt>
                      <dd className="text-primary">{project.regions.join(project.locale === "ar" ? "، " : ", ")}</dd>
                    </div>
                  ) : null}
                </dl>
                {client?.slug ? <ClientProjectsLink label={t("clientProjectsLink")} slug={client.slug} /> : null}
              </div>
            )}
          </div>

          {project.scope.length > 0 ? (
            <div className="flex flex-col gap-5 lg:gap-0" data-section-part="scope">
              <h3 className="font-display text-h3 text-primary">{copy.scope_title}</h3>
              <ol>
                {project.scope.map((item, index) => (
                  <li className="flex items-baseline gap-3.5 border-b border-line py-3.5 lg:gap-6 lg:py-5.5" key={item}>
                    <span className="font-latin text-overline text-accent">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-body-l text-primary">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <ProjectGallery images={project.gallery} />

          {hasOverview && client?.slug ? (
            <div>
              <ClientProjectsLink label={t("clientProjectsLink")} slug={client.slug} />
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-32">
          <ProjectInquiryCard projectSlug={project.slug} text={copy.inquiry_text} title={copy.inquiry_title} />
        </aside>
      </Container>
    </section>
  );
}
