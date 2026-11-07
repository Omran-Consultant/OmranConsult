import { getTranslations } from "next-intl/server";

import { PageHero } from "@/core/ui/page-hero";
import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { SECTION_BACKGROUND_IMAGES, toImageAsset } from "@/features/media/profile-images";
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
  const layoutT = await getTranslations("Layout");
  const title = project.title ?? t("detailFallbackTitle");
  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: t("headerTitle"), path: "/projects" },
    { name: title, path: `/projects/${project.slug}` },
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />

      <div data-section="header">
        <PageHero
          breadcrumbLabel={layoutT("breadcrumbLabel")}
          breadcrumbs={[
            { label: layoutT("nav.home"), href: "/" },
            { label: t("headerTitle"), href: "/projects" },
            { label: title },
          ]}
          image={toImageAsset(SECTION_BACKGROUND_IMAGES.featured_projects, locale)}
          title={title}
        />
      </div>

      <section className="px-page py-section-y" data-section="detail">
        {project.client?.name && project.client.slug ? (
          <p className="text-base text-secondary">
            {t("ownerLabel")}{" "}
            <Link
              className="font-semibold text-accent underline-offset-4 hover:underline"
              href={`/projects?${new URLSearchParams({ client: project.client.slug }).toString()}`}
            >
              {project.client.name}
            </Link>
          </p>
        ) : null}

        {project.regions.length > 0 ? (
          <p className="mt-4 text-base text-secondary">
            {t("regionsLabel")} {project.regions.map((region) => region.name ?? region.slug).join(" · ")}
          </p>
        ) : null}

        <Link className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-accent underline-offset-4 hover:underline" href="/projects">
          {t("backToProjects")}
        </Link>
      </section>

      {project.relatedProjects.length > 0 ? (
        <section className="border-t border-line bg-surface px-page py-section-y" data-section="related-projects">
          <h2 className="font-display text-2xl font-bold text-primary">{t("relatedProjectsHeading")}</h2>
          <ul className="mt-6 space-y-3">
            {project.relatedProjects.map((related) => (
              <li key={related.slug}>
                <Link
                  className="text-lg font-medium text-primary underline-offset-4 hover:text-accent hover:underline"
                  href={`/projects/${related.slug}`}
                >
                  {related.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
