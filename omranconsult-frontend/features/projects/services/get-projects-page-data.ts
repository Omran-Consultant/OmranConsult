import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicClients,
  fetchPublicProjects,
  fetchPublicRegions,
} from "@/lib/api/public-content";
import {
  mapClientsToUiModel,
  mapProjectsIndexToUiModel,
  mapRegionsToUiModel,
} from "@/features/public-content/services/public-content-mappers";

export type ProjectsFilters = {
  client?: string;
  region?: string;
  page?: number;
};

export async function getProjectsPageData(locale: AppLocale, filters: ProjectsFilters) {
  const [projectsPayload, clientsPayload, regionsPayload] = await Promise.all([
    fetchPublicProjects(locale, {
      client: filters.client,
      region: filters.region,
      page: filters.page,
      perPage: 12,
    }),
    fetchPublicClients(locale),
    fetchPublicRegions(locale),
  ]);

  return {
    projects: mapProjectsIndexToUiModel(projectsPayload),
    clients: mapClientsToUiModel(clientsPayload),
    regions: mapRegionsToUiModel(regionsPayload),
  };
}
