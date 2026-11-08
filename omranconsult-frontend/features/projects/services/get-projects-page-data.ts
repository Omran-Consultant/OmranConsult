import { formatStats } from "@/core/format/statistic";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { PAGE_SIZE, type ProjectsFilters } from "@/features/projects/services/projects-filters";
import { PROJECTS_HERO_STAT_KEYS, projectsCopySchema, toProjectCards } from "@/features/projects/services/projects-view";
import {
  mapClientsToUiModel,
  mapHomeToUiModel,
  mapPageToBlocks,
  mapProjectsIndexToUiModel,
  mapRegionsToUiModel,
  mapSectorsToUiModel,
} from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicClients,
  fetchPublicHome,
  fetchPublicPage,
  fetchPublicProjects,
  fetchPublicRegions,
  fetchPublicSectors,
} from "@/lib/api/public-content";

/**
 * One request returns pages 1…N: the mobile list shows all of them («عرض المزيد» appends a page),
 * the desktop grid shows only page N.
 */
export async function getProjectsPageData(locale: AppLocale, filters: ProjectsFilters) {
  const [home, page, sectors, clients, regions, list] = await Promise.all([
    fetchPublicHome(locale),
    fetchPublicPage(locale, "projects"),
    fetchPublicSectors(locale),
    fetchPublicClients(locale),
    fetchPublicRegions(locale),
    fetchPublicProjects(locale, {
      sector: filters.sector,
      q: filters.q,
      client: filters.client,
      region: filters.region,
      page: 1,
      perPage: PAGE_SIZE * filters.page,
    }),
  ]);

  const copy = projectsCopySchema.parse(mapPageToBlocks(page).design_copy ?? {});
  const projects = mapProjectsIndexToUiModel(list);
  const cards = toProjectCards(projects.projects, locale);
  const total = projects.meta.total;
  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(filters.page, lastPage);
  const clientModels = mapClientsToUiModel(clients);

  return {
    locale,
    filters,
    copy,
    heroImage: toImageAsset(SITE_IMAGES.riyadhTeal, locale),
    heroStats: formatStats(mapHomeToUiModel(home).statistics, PROJECTS_HERO_STAT_KEYS, locale).map((stat) => ({
      value: stat.value,
      label: copy.hero.stat_labels[stat.key] ?? stat.label,
    })),
    sectors: mapSectorsToUiModel(sectors).filter((sector): sector is typeof sector & { name: string } => Boolean(sector.name)),
    owners: clientModels
      .filter((client) => client.slug && client.name && client.projectsCount > 0)
      .map((client) => ({ slug: client.slug as string, name: client.name as string })),
    regions: mapRegionsToUiModel(regions)
      .filter((region) => region.name)
      .map((region) => ({ slug: region.slug, name: region.name as string })),
    clientNames: clientModels.filter((client) => client.inClientList && client.name).map((client) => client.name as string),
    desktopCards: cards.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    mobileCards: cards,
    total,
    currentPage,
    lastPage,
  };
}

export type ProjectsView = Awaited<ReturnType<typeof getProjectsPageData>>;
