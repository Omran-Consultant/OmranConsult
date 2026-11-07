import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicClients,
  fetchPublicDocuments,
  fetchPublicExperts,
  fetchPublicHome,
  fetchPublicPartners,
  fetchPublicProjects,
  fetchPublicRegions,
  fetchPublicServices,
  fetchPublicSettings,
} from "@/lib/api/public-content";
import {
  mapClientsToUiModel,
  mapDocumentsToUiModel,
  mapExpertsToUiModel,
  mapHomeToUiModel,
  mapPartnersToUiModel,
  mapProjectsIndexToUiModel,
  mapRegionsToUiModel,
  mapServicesToUiModel,
  mapSettingsToUiModel,
} from "@/features/public-content/services/public-content-mappers";

export async function getHomePageData(locale: AppLocale) {
  const [
    settingsPayload,
    homePayload,
    servicesPayload,
    projectsPayload,
    regionsPayload,
    documentsPayload,
    partnersPayload,
    clientsPayload,
    expertsPayload,
  ] = await Promise.all([
    fetchPublicSettings(locale),
    fetchPublicHome(locale),
    fetchPublicServices(locale),
    fetchPublicProjects(locale, { perPage: 6 }),
    fetchPublicRegions(locale),
    fetchPublicDocuments(locale),
    fetchPublicPartners(locale),
    fetchPublicClients(locale),
    fetchPublicExperts(locale),
  ]);

  return {
    settings: mapSettingsToUiModel(settingsPayload),
    home: mapHomeToUiModel(homePayload),
    services: mapServicesToUiModel(servicesPayload),
    projects: mapProjectsIndexToUiModel(projectsPayload),
    regions: mapRegionsToUiModel(regionsPayload),
    documents: mapDocumentsToUiModel(documentsPayload),
    partners: mapPartnersToUiModel(partnersPayload),
    clients: mapClientsToUiModel(clientsPayload),
    experts: mapExpertsToUiModel(expertsPayload),
  };
}
