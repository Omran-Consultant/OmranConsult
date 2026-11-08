import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/core/ui/button";
import { Container } from "@/core/ui/container";
import { Icon } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import { ProjectInquiryCard } from "@/features/projects/components/project-inquiry-card";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";
import { Link } from "@/i18n/navigation";

/**
 * Figma "Body": overview, scope and gallery (800 wide) beside the sticky 400-px inquiry card;
 * below 1024 px the card follows the content. Without an overview (every profile project today)
 * the area shows the owner, the regions and a link to the owner's other projects (§6.5 edge case).
 */
export async function ProjectBody({ project, title }: { readonly project: ProjectDetailView; readonly title: string }) {
  const t = await getTranslations("ProjectsPage");
  const { copy } = project;
  const [mainImage, ...sideImages] = project.gallery;

  return (
    <section className="py-10 lg:py-30" data-section="body">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-20">
        <div className="flex min-w-0 flex-col gap-10 lg:gap-12">
          <SectionHeader overline={copy.overview_overline} subtitle={project.overview} title={copy.overview_title ?? title}>
            {project.overview ? null : (
              <div className="flex flex-col items-start gap-5">
                <dl className="flex flex-col gap-3 text-body-l">
                  {project.client ? (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-muted">{t("ownerLabel")}:</dt>
                      <dd className="text-primary">{project.client.name}</dd>
                    </div>
                  ) : null}
                  {project.regions.length > 0 ? (
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-muted">{t("regionsLabel")}:</dt>
                      <dd className="text-primary">{project.regions.join(project.locale === "ar" ? "، " : ", ")}</dd>
                    </div>
                  ) : null}
                </dl>
                {project.client?.slug ? (
                  <Link className={buttonClassName("ghost")} href={`/projects?client=${encodeURIComponent(project.client.slug)}`}>
                    <span>{t("clientProjectsLink")}</span>
                    <Icon className="text-accent" name="arrow" />
                  </Link>
                ) : null}
              </div>
            )}
          </SectionHeader>

          {project.scope.length > 0 ? (
            <div className="flex flex-col gap-4 lg:gap-6">
              <h3 className="font-display text-h3 text-primary">{copy.scope_title}</h3>
              <ol>
                {project.scope.map((item, index) => (
                  <li className="flex items-baseline gap-3.5 border-b border-line py-3.5 lg:gap-4 lg:py-5.5" key={item}>
                    <span className="font-latin text-overline text-accent">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-body-l text-primary">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {mainImage ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative h-55 overflow-hidden rounded-lg md:col-span-2 md:h-110">
                <Image alt={mainImage.alt} className="object-cover" fill sizes="(min-width: 1024px) 800px, 100vw" src={mainImage.src} />
              </div>
              {sideImages.slice(0, 2).map((image) => (
                <div className="relative h-55 overflow-hidden rounded-lg md:h-70" key={image.src}>
                  <Image alt={image.alt} className="object-cover" fill sizes="(min-width: 1024px) 392px, (min-width: 768px) 50vw, 100vw" src={image.src} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28">
          <ProjectInquiryCard projectSlug={project.slug} text={copy.inquiry_text} title={copy.inquiry_title} />
        </aside>
      </Container>
    </section>
  );
}
