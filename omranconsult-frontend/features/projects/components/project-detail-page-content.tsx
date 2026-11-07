import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/core/ui/page-header";
import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
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
        <PageHeader image={SECTION_BACKGROUND_IMAGES.featured_projects} locale={locale} title={title} />
      </div>

      <section className="px-(--oc-page-margin) py-(--oc-section-y)" data-section="detail">
        {project.client?.name && project.client.slug ? (
          <p className="text-base text-muted">
            {t("ownerLabel")}{" "}
            <Link
              className="font-semibold text-brand-green-strong underline-offset-4 hover:underline"
              href={`/projects?${new URLSearchParams({ client: project.client.slug }).toString()}`}
            >
              {project.client.name}
            </Link>
          </p>
        ) : null}

        {project.regions.length > 0 ? (
          <p className="mt-4 text-base text-muted">
            {t("regionsLabel")} {project.regions.map((region) => region.name ?? region.slug).join(" · ")}
          </p>
        ) : null}

        <Link className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-brand-green-strong underline-offset-4 hover:underline" href="/projects">
          {t("backToProjects")}
        </Link>
      </section>

      {project.relatedProjects.length > 0 ? (
        <section className="border-t border-border bg-surface px-(--oc-page-margin) py-(--oc-section-y)" data-section="related-projects">
          <h2 className="font-display text-2xl font-bold text-heading">{t("relatedProjectsHeading")}</h2>
          <ul className="mt-6 space-y-3">
            {project.relatedProjects.map((related) => (
              <li key={related.slug}>
                <Link
                  className="text-lg font-medium text-heading underline-offset-4 hover:text-brand-green-strong hover:underline"
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
