import { getTranslations } from "next-intl/server";

import { Card } from "@/core/ui/card";
import { EmptyState } from "@/core/ui/empty-state";
import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { PageHeader } from "@/core/ui/page-header";
import { Section } from "@/core/ui/section";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import { RegionsMapFilter } from "@/features/projects/components/regions-map-filter";
import type { ProjectsFilters } from "@/features/projects/services/get-projects-page-data";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type ProjectsPageData = Awaited<
  ReturnType<typeof import("@/features/projects/services/get-projects-page-data").getProjectsPageData>
>;

type ProjectsPageContentProps = {
  readonly locale: AppLocale;
  readonly data: ProjectsPageData;
  readonly filters: ProjectsFilters;
};

function buildQuery(filters: ProjectsFilters): string {
  const params = new URLSearchParams();
  if (filters.client) {
    params.set("client", filters.client);
  }
  if (filters.region) {
    params.set("region", filters.region);
  }
  if (filters.page) {
    params.set("page", String(filters.page));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function ProjectsPageContent({ locale, data, filters }: ProjectsPageContentProps) {
  const t = await getTranslations("ProjectsPage");
  const clients = data.clients.filter((client) => client.slug && client.projectsCount > 0 && client.name);
  const regions = data.regions.filter((region) => region.name);
  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: t("headerTitle"), path: "/projects" },
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />
      <PageHeader
        description={t("headerDescription")}
        image={SECTION_BACKGROUND_IMAGES.featured_projects}
        locale={locale}
        title={t("headerTitle")}
      />

      <Section heading={t("filtersHeading")}>
        <form action="" className="grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-muted">{t("clientFilterLabel")}</span>
            <select className="w-full rounded-lg border border-border bg-surface p-2" defaultValue={filters.client ?? ""} name="client">
              <option value="">{t("allClients")}</option>
              {clients.map((client) => (
                <option key={client.slug} value={client.slug ?? ""}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted">{t("regionFilterLabel")}</span>
            <select className="w-full rounded-lg border border-border bg-surface p-2" defaultValue={filters.region ?? ""} name="region">
              <option value="">{t("allRegions")}</option>
              {regions.map((region) => (
                <option key={region.slug} value={region.slug}>
                  {region.name}
                </option>
              ))}
            </select>
          </label>
          <input name="page" type="hidden" value="1" />
          <div className="flex items-end gap-2 md:col-span-2">
            <button className="rounded-lg bg-brand-green-strong px-4 py-2 text-sm font-semibold text-white" type="submit">
              {t("applyFilters")}
            </button>
            <Link className="rounded-lg border border-border px-4 py-2 text-sm font-semibold" href="/projects">
              {t("clearFilters")}
            </Link>
          </div>
        </form>
      </Section>

      <Section heading={t("projectsHeading")}>
        {data.projects.projects.length === 0 ? (
          <EmptyState description={t("emptyDescription")} title={t("emptyTitle")} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.projects.projects.map((project) => (
              <Card key={project.slug}>
                <h2 className="font-display text-lg font-semibold text-heading">{project.title}</h2>
                {project.client?.name && project.client.slug ? (
                  <p className="mt-2 text-sm text-muted">
                    <Link href={`/projects?${new URLSearchParams({ client: project.client.slug }).toString()}`}>
                      {project.client.name}
                    </Link>
                  </p>
                ) : null}
                {project.regions.length > 0 ? (
                  <p className="mt-1 text-sm text-muted">
                    {project.regions.map((region) => region.name ?? region.slug).join(" - ")}
                  </p>
                ) : null}
                <Link className="mt-4 inline-flex text-sm font-semibold text-brand-green-strong" href={`/projects/${project.slug}`}>
                  {t("detailLink")}
                </Link>
              </Card>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: data.projects.meta.last_page }, (_, index) => {
            const page = index + 1;
            return (
              <Link
                className="rounded-lg border border-border px-3 py-1 text-sm"
                href={`/projects${buildQuery({ ...filters, page })}`}
                key={page}
              >
                {page}
              </Link>
            );
          })}
        </div>
      </Section>

      <Section heading={t("mapHeading")}>
        <RegionsMapFilter regions={regions} selectedRegion={filters.region} />
        {filters.region ? <p className="text-sm text-muted">{t("regionSoonNotice")}</p> : null}
      </Section>

      <Section heading={t("clientsHeading")}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.slug}>
              <Link
                className="font-semibold text-heading hover:text-brand-green-strong"
                href={`/projects${buildQuery({ ...filters, client: client.slug ?? undefined, page: 1 })}`}
              >
                {client.name}
              </Link>
            </Card>
          ))}
        </div>
      </Section>
    </main>
  );
}
