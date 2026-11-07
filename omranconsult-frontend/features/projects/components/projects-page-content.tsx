import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { EmptyState } from "@/core/ui/empty-state";
import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { PageHero } from "@/core/ui/page-hero";
import { getClientLogo } from "@/features/media/brand-logos";
import { ProjectOwnerLogo } from "@/features/media/project-owner-logo";
import { SECTION_BACKGROUND_IMAGES, getProfileImageAlt, toImageAsset } from "@/features/media/profile-images";
import {
  featuredProjectImage,
  groupFeaturedProjects,
  PROJECT_LAYOUT_CLASS,
} from "@/features/home/lib/featured-projects";
import { ProjectsPageMapPanel } from "@/features/projects/components/projects-page-map-panel";
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
  const homeT = await getTranslations("HomePage");
  const layoutT = await getTranslations("Layout");
  const clients = data.clients.filter((client) => client.slug && client.projectsCount > 0 && client.name);
  const listedClients = data.clients.filter((client) => client.inClientList);
  const regions = data.regions.filter((region) => region.name);
  const hasActiveFilter = Boolean(filters.client || filters.region);
  const clientOrder = new Map(
    data.clients.filter((client) => client.slug).map((client) => [client.slug as string, client.sortOrder]),
  );
  const entityGroups = groupFeaturedProjects(data.projects.projects, clientOrder);
  const breadcrumbs = buildBreadcrumbJsonLd(locale, [
    { name: locale === "ar" ? "الرئيسية" : "Home", path: "" },
    { name: t("headerTitle"), path: "/projects" },
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={breadcrumbs} />

      <div data-section="header">
        <PageHero
          breadcrumbLabel={layoutT("breadcrumbLabel")}
          breadcrumbs={[{ label: layoutT("nav.home"), href: "/" }, { label: t("headerTitle") }]}
          image={toImageAsset(SECTION_BACKGROUND_IMAGES.featured_projects, locale)}
          intro={t("headerDescription")}
          title={t("headerTitle")}
        />
      </div>

      <section
        className="bg-accent-strong px-page py-section-y text-white"
        data-section="map"
      >
        <h2 className="font-display text-h1 leading-tight font-bold">{t("mapHeading")}</h2>
        <ProjectsPageMapPanel regions={regions} selectedRegion={filters.region} />
      </section>

      <section className="px-page py-section-y" data-section="filters">
        <h2 className="font-display text-2xl font-bold text-primary">{t("filtersHeading")}</h2>
        <form action="" className="mt-6 grid gap-4 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-secondary">{t("clientFilterLabel")}</span>
            <select className="w-full rounded-lg border border-line bg-surface p-2" defaultValue={filters.client ?? ""} name="client">
              <option value="">{t("allClients")}</option>
              {clients.map((client) => (
                <option key={client.slug} value={client.slug ?? ""}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-secondary">{t("regionFilterLabel")}</span>
            <select className="w-full rounded-lg border border-line bg-surface p-2" defaultValue={filters.region ?? ""} name="region">
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
            <button className="min-h-11 rounded-full bg-accent-strong px-5 py-2.5 text-sm font-semibold text-white" type="submit">
              {t("applyFilters")}
            </button>
            <Link className="inline-flex min-h-11 items-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold" href="/projects">
              {t("clearFilters")}
            </Link>
          </div>
        </form>
      </section>

      <section className="px-page pb-(--section-y)" data-section="grid">
        <h2 className="font-display text-2xl font-bold text-primary">{t("projectsHeading")}</h2>

        {data.projects.projects.length === 0 ? (
          <div className="mt-6">
            <EmptyState description={t("emptyDescription")} title={t("emptyTitle")} />
          </div>
        ) : hasActiveFilter ? (
          <ul className="mt-8 space-y-6">
            {data.projects.projects.map((project) => (
              <li className="border-b border-line pb-6" key={project.slug}>
                {project.client?.name ? (
                  <p className="text-sm font-bold text-accent">{project.client.name}</p>
                ) : null}
                <Link
                  className="mt-1 block text-lg font-semibold text-primary underline-offset-4 hover:text-accent hover:underline"
                  href={`/projects/${project.slug}`}
                >
                  {project.title}
                </Link>
                {project.regions.length > 0 ? (
                  <p className="mt-2 text-sm text-secondary">
                    {project.regions.map((region) => region.name ?? region.slug).join(" · ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-(--section-y) flex flex-col gap-20">
            {entityGroups.map((group, index) => {
              const layout = PROJECT_LAYOUT_CLASS[index % PROJECT_LAYOUT_CLASS.length];
              const image = featuredProjectImage(index);
              const ownerHasLogo = group.clientSlug ? Boolean(getClientLogo(group.clientSlug, 0)) : false;
              return (
                <article
                  className={`home-proj ${layout} grid grid-cols-12 items-center gap-6`}
                  data-owner-has-logo={ownerHasLogo ? "true" : undefined}
                  key={group.clientSlug ?? index}
                >
                  <figure className="relative m-0 overflow-hidden rounded-lg">
                    <Image
                      alt={getProfileImageAlt(image, locale)}
                      className="h-full w-full object-cover"
                      height={image.height}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      src={image.src}
                      width={image.width}
                    />
                  </figure>
                  <div className="home-proj-text">
                    {group.clientSlug ? (
                      <ProjectOwnerLogo
                        locale={locale}
                        name={group.clientName}
                        slug={group.clientSlug}
                      />
                    ) : null}
                    {group.clientName ? (
                      <p className="mb-2 text-sm font-bold text-accent">{group.clientName}</p>
                    ) : null}
                    <ul className="mt-2 space-y-2">
                      {group.projects.map((project) => (
                        <li key={project.slug}>
                          <Link
                            className="text-lg leading-relaxed text-primary underline-offset-4 hover:text-accent hover:underline"
                            href={`/projects/${project.slug}`}
                          >
                            {project.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {data.projects.meta.last_page > 1 ? (
          <nav aria-label={t("projectsHeading")} className="mt-10 flex flex-wrap gap-2">
            {Array.from({ length: data.projects.meta.last_page }, (_, index) => {
              const page = index + 1;
              return (
                <Link
                  className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm font-medium"
                  href={`/projects${buildQuery({ ...filters, page })}`}
                  key={page}
                >
                  {page}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </section>

      <section
        className="bg-elevated px-page py-section-y text-white"
        data-section="clients"
      >
        <h2 className="font-display text-3xl font-bold md:text-4xl">{t("clientsHeading")}</h2>
        <ul className="mt-8 columns-2 gap-8 text-base leading-snug md:columns-3 xl:columns-4">
          {listedClients.map((client) => (
            <li className="mb-2 break-inside-avoid" key={`${client.sortOrder}-${client.slug ?? "client"}`}>
              {client.name?.trim() ? client.name : homeT("unnamedClient")}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
