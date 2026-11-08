import { aboutBlocksSchema, aboutCopySchema, clientLogos, formatStats, partnerCards } from "@/features/about/services/about-view";
import { homeCopySchema } from "@/features/home/services/home-copy";
import { shortStandardCode } from "@/features/home/lib/standard-code";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import {
  mapClientsToUiModel,
  mapDocumentsToUiModel,
  mapExpertsToUiModel,
  mapHomeToUiModel,
  mapOrgChartToUiModel,
  mapPageToBlocks,
  mapPartnersToUiModel,
  mapSettingsToUiModel,
} from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import {
  fetchPublicClients,
  fetchPublicDocuments,
  fetchPublicExperts,
  fetchPublicHome,
  fetchPublicOrgChart,
  fetchPublicPage,
  fetchPublicPartners,
  fetchPublicSettings,
} from "@/lib/api/public-content";

export async function getAboutPageData(locale: AppLocale) {
  const [settings, home, page, experts, orgChart, documents, partners, partnersEn, clients] = await Promise.all([
    fetchPublicSettings(locale),
    fetchPublicHome(locale),
    fetchPublicPage(locale, "about"),
    fetchPublicExperts(locale),
    fetchPublicOrgChart(locale),
    fetchPublicDocuments(locale),
    fetchPublicPartners(locale),
    fetchPublicPartners("en"),
    fetchPublicClients(locale),
  ]);

  const homeModel = mapHomeToUiModel(home);
  const blocks = aboutBlocksSchema.parse(homeModel.blocks);
  const homeCopy = homeCopySchema.parse(homeModel.blocks.design_copy ?? {});
  const docs = mapDocumentsToUiModel(documents);
  const slides = new Map(homeModel.heroSlides.map((slide) => [slide.key, slide]));
  const englishNames = new Map(mapPartnersToUiModel(partnersEn).map((partner) => [partner.slug, partner.name]));
  const partnerModels = mapPartnersToUiModel(partners);

  return {
    locale,
    copy: aboutCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}),
    homeCopy,
    blocks,
    slides: {
      vision: slides.get("vision"),
      governance: slides.get("governance"),
      partners: slides.get("partners"),
      clients: slides.get("clients"),
    },
    introStats: formatStats(homeModel.statistics, ["years_experience", "group_experience"], locale),
    experts: mapExpertsToUiModel(experts),
    orgChart: mapOrgChartToUiModel(orgChart),
    certificates: docs
      .filter((doc) => doc.kind === "iso_certificate" && doc.standardCode)
      .map((doc) => ({ id: doc.id, code: shortStandardCode(doc.standardCode as string), label: doc.title, expired: doc.isExpired })),
    licenses: docs.filter((doc) => doc.kind === "license" && doc.title).map((doc) => ({ id: doc.id, label: doc.title as string })),
    wordmarks: partnerModels
      .filter((partner) => partner.slug)
      .map((partner) => ({
        key: partner.slug as string,
        title: partner.name,
        wordmark: (englishNames.get(partner.slug) ?? partner.name ?? "").split(" — ")[0]?.trim().toUpperCase() ?? "",
      })),
    partners: partnerCards(partnerModels),
    clients: clientLogos(mapClientsToUiModel(clients)),
    images: {
      hero: toImageAsset(SITE_IMAGES.facade, locale),
      team: toImageAsset(SITE_IMAGES.team, locale),
      strategy: toImageAsset(SITE_IMAGES.building, locale),
      cta: toImageAsset(SITE_IMAGES.night, locale),
    },
    profilePdfUrl: mapSettingsToUiModel(settings).profilePdfUrl,
  };
}

export type AboutView = Awaited<ReturnType<typeof getAboutPageData>>;
