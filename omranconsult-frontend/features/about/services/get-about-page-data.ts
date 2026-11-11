import { formatStats } from "@/core/format/statistic";
import { aboutBlocksSchema, aboutCopySchema, clientLogos } from "@/features/about/services/about-view";
import { partnerCards } from "@/features/media/brand-logos";
import { homeCopySchema } from "@/features/public-content/services/home-copy";
import { shortStandardCode } from "@/core/format/standard-code";
import { certificateScan, licenseScan } from "@/features/media/credential-scans";
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
  const [settings, home, page, experts, orgChart, documents, partners, clients] = await Promise.all([
    fetchPublicSettings(locale),
    fetchPublicHome(locale),
    fetchPublicPage(locale, "about"),
    fetchPublicExperts(locale),
    fetchPublicOrgChart(locale),
    fetchPublicDocuments(locale),
    fetchPublicPartners(locale),
    fetchPublicClients(locale),
  ]);

  const homeModel = mapHomeToUiModel(home);
  const blocks = aboutBlocksSchema.parse(homeModel.blocks);
  const homeCopy = homeCopySchema.parse(homeModel.blocks.design_copy ?? {});
  const docs = mapDocumentsToUiModel(documents);
  const slides = new Map(homeModel.heroSlides.map((slide) => [slide.key, slide]));
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
    /** Work stages coverage card: the existing statistic with the seeded short label (Home stats copy). */
    coverageStat: formatStats(homeModel.statistics, ["project_volume"], locale).map((stat) => ({
      value: stat.value,
      label: homeCopy.stats.short_labels[stat.key] ?? stat.label,
    }))[0],
    experts: mapExpertsToUiModel(experts),
    orgChart: mapOrgChartToUiModel(orgChart),
    certificates: docs
      .filter((doc) => doc.kind === "iso_certificate" && doc.standardCode)
      .map((doc) => {
        const code = shortStandardCode(doc.standardCode as string);
        return {
          id: doc.id,
          code,
          label: doc.title,
          expired: doc.isExpired,
          image: certificateScan(doc.slug ?? code) ?? certificateScan(code),
        };
      }),
    licenses: docs
      .filter((doc) => doc.kind === "license" && doc.title && doc.slug)
      .map((doc) => ({ id: doc.id, label: doc.title as string, image: licenseScan(doc.slug as string) })),
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
