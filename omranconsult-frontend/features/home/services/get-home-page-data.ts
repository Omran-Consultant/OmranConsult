import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicDocuments,
  fetchPublicHome,
  fetchPublicPartners,
  fetchPublicProjects,
  fetchPublicRegions,
  fetchPublicSectors,
  fetchPublicServices,
  fetchPublicSettings,
} from "@/lib/api/public-content";
import {
  mapDocumentsToUiModel,
  mapHomeToUiModel,
  mapPartnersToUiModel,
  mapProjectsIndexToUiModel,
  mapRegionsToUiModel,
  mapSectorsToUiModel,
  mapServicesToUiModel,
  mapSettingsToUiModel,
} from "@/features/public-content/services/public-content-mappers";
import { buildHomeView } from "@/features/home/services/home-view";

export async function getHomePageData(locale: AppLocale) {
  const [settings, home, sectors, projects, featured, regions, certificates, partners, services] = await Promise.all([
    fetchPublicSettings(locale),
    fetchPublicHome(locale),
    fetchPublicSectors(locale),
    fetchPublicProjects(locale, { perPage: 100 }),
    fetchPublicProjects(locale, { featured: true, perPage: 6 }),
    fetchPublicRegions(locale),
    fetchPublicDocuments(locale, "iso_certificate"),
    fetchPublicPartners(locale),
    fetchPublicServices(locale),
  ]);

  return buildHomeView(locale, {
    settings: mapSettingsToUiModel(settings),
    home: mapHomeToUiModel(home),
    sectors: mapSectorsToUiModel(sectors),
    projects: mapProjectsIndexToUiModel(projects).projects,
    featured: mapProjectsIndexToUiModel(featured).projects,
    regions: mapRegionsToUiModel(regions),
    certificates: mapDocumentsToUiModel(certificates),
    partners: mapPartnersToUiModel(partners),
    serviceCategories: mapServicesToUiModel(services),
  });
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>;
