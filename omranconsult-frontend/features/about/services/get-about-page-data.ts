import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicDocuments,
  fetchPublicExperts,
  fetchPublicHome,
  fetchPublicOrgChart,
  fetchPublicPartners,
} from "@/lib/api/public-content";
import {
  mapDocumentsToUiModel,
  mapExpertsToUiModel,
  mapHomeToUiModel,
  mapOrgChartToUiModel,
  mapPartnersToUiModel,
} from "@/features/public-content/services/public-content-mappers";

export async function getAboutPageData(locale: AppLocale) {
  const [homePayload, expertsPayload, orgPayload, documentsPayload, partnersPayload] =
    await Promise.all([
      fetchPublicHome(locale),
      fetchPublicExperts(locale),
      fetchPublicOrgChart(locale),
      fetchPublicDocuments(locale),
      fetchPublicPartners(locale),
    ]);

  return {
    home: mapHomeToUiModel(homePayload),
    experts: mapExpertsToUiModel(expertsPayload),
    orgChart: mapOrgChartToUiModel(orgPayload),
    documents: mapDocumentsToUiModel(documentsPayload),
    partners: mapPartnersToUiModel(partnersPayload),
  };
}
