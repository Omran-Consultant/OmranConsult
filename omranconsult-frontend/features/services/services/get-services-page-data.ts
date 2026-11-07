import type { AppLocale } from "@/i18n/routing";
import { fetchPublicHome, fetchPublicServices } from "@/lib/api/public-content";
import {
  mapHomeToUiModel,
  mapServicesToUiModel,
} from "@/features/public-content/services/public-content-mappers";

export async function getServicesPageData(locale: AppLocale) {
  const [homePayload, servicesPayload] = await Promise.all([
    fetchPublicHome(locale),
    fetchPublicServices(locale),
  ]);

  return {
    home: mapHomeToUiModel(homePayload),
    services: mapServicesToUiModel(servicesPayload),
  };
}
