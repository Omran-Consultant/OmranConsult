import { homeCopySchema } from "@/features/home/services/home-copy";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { mapHomeToUiModel, mapPageToBlocks, mapServicesToUiModel, mapSettingsToUiModel } from "@/features/public-content/services/public-content-mappers";
import { servicesBlocksSchema, servicesCopySchema } from "@/features/services/services/services-view";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicHome, fetchPublicPage, fetchPublicServices, fetchPublicSettings } from "@/lib/api/public-content";

export async function getServicesPageData(locale: AppLocale) {
  const [home, page, services, settings] = await Promise.all([
    fetchPublicHome(locale),
    fetchPublicPage(locale, "services"),
    fetchPublicServices(locale),
    fetchPublicSettings(locale),
  ]);

  const homeModel = mapHomeToUiModel(home);
  const categories = mapServicesToUiModel(services);

  return {
    locale,
    copy: servicesCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}),
    cta: homeCopySchema.parse(homeModel.blocks.design_copy ?? {}).cta,
    blocks: servicesBlocksSchema.parse(homeModel.blocks),
    pillars: categories.filter((category) => category.kind === "axis"),
    assetManagement: categories.find((category) => category.kind === "asset_management"),
    engineering: categories.find((category) => category.kind === "engineering_design"),
    images: {
      hero: toImageAsset(SITE_IMAGES.cad, locale),
      assetManagement: toImageAsset(SITE_IMAGES.tablet, locale),
      engineering: toImageAsset(SITE_IMAGES.truss, locale),
      cta: toImageAsset(SITE_IMAGES.night, locale),
    },
    profilePdfUrl: mapSettingsToUiModel(settings).profilePdfUrl,
  };
}

export type ServicesView = Awaited<ReturnType<typeof getServicesPageData>>;
