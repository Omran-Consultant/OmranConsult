import type { IconName } from "@/core/ui/icon";
import { isIconName } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { groupRegions } from "@/features/home/lib/coverage-groups";
import { shortStandardCode } from "@/core/format/standard-code";
import { homeCopySchema, serviceHighlightsSchema, type HomeCopy } from "@/features/public-content/services/home-copy";
import { formatStatisticValue } from "@/core/format/statistic";
import { partnerCards } from "@/features/media/brand-logos";
import { certificateScan } from "@/features/media/credential-scans";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { projectImage } from "@/features/projects/services/projects-view";
import type {
  mapDocumentsToUiModel,
  mapHomeToUiModel,
  mapPartnersToUiModel,
  mapProjectsIndexToUiModel,
  mapRegionsToUiModel,
  mapSectorsToUiModel,
  mapServicesToUiModel,
  mapSettingsToUiModel,
} from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";

type HomeSources = {
  readonly settings: ReturnType<typeof mapSettingsToUiModel>;
  readonly home: ReturnType<typeof mapHomeToUiModel>;
  readonly sectors: ReturnType<typeof mapSectorsToUiModel>;
  readonly projects: ReturnType<typeof mapProjectsIndexToUiModel>["projects"];
  readonly featured: ReturnType<typeof mapProjectsIndexToUiModel>["projects"];
  readonly regions: ReturnType<typeof mapRegionsToUiModel>;
  readonly certificates: ReturnType<typeof mapDocumentsToUiModel>;
  readonly partners: ReturnType<typeof mapPartnersToUiModel>;
  readonly serviceCategories: ReturnType<typeof mapServicesToUiModel>;
};

export type HomeStat = { readonly key: string; readonly value: string; readonly label: string | undefined };

export type HomeProject = {
  readonly slug: string;
  readonly title: string;
  readonly client?: string;
  readonly category?: string;
  readonly sectorSlug?: string;
  readonly region?: string;
  readonly year?: number;
  readonly image: ImageAsset;
};

export type HomeServiceHighlight = {
  readonly number: string;
  readonly icon: IconName;
  readonly title: string;
  readonly description?: string;
  readonly href: string;
  readonly capabilityItems?: readonly string[];
  readonly featuredImage?: ImageAsset;
};

/** The five profile statistics in the profile order (Stats section). */
const PROFILE_STAT_KEYS = ["completed_projects", "project_volume", "employees", "local_content", "partnerships"];

/** The design's five sector chips on Home (H4); the Projects page lists every sector. */
const HOME_SECTOR_SLUGS = ["education", "health", "water-and-environment", "infrastructure", "universities"];

/** Hero mini-stats in reading order (21+ first in RTL, as designed). */
const HERO_STAT_KEYS = ["years_experience", "completed_projects", "project_volume"];

export function buildHomeView(locale: AppLocale, sources: HomeSources) {
  const copy: HomeCopy = homeCopySchema.parse(sources.home.blocks.design_copy ?? {});
  const statsByKey = new Map(
    sources.home.statistics.map((stat) => [
      stat.key,
      {
        key: stat.key,
        value: formatStatisticValue({ value: stat.value, scale: stat.scale, suffix: stat.suffix, unit: stat.unit, locale }),
        label: stat.label,
      },
    ]),
  );
  const pick = (keys: readonly string[]) => keys.map((key) => statsByKey.get(key)).filter((stat): stat is HomeStat => Boolean(stat));

  const sectorNames = new Map(sources.sectors.map((sector) => [sector.slug, sector.name]));
  const toProject = (project: HomeSources["projects"][number]): HomeProject => {
      return {
        slug: project.slug,
        title: project.title as string,
        client: project.client?.name,
        category: project.sector ? (project.sector.name ?? sectorNames.get(project.sector.slug)) : undefined,
        sectorSlug: project.sector?.slug,
        region: project.regions.find((entry) => entry.name)?.name,
        year: project.year,
        image: projectImage(project.imageKey, locale, {
          url: project.imageUrl,
          srcSet: project.imageSrcSet,
          width: project.imageWidth,
          height: project.imageHeight,
          alt: project.imageAlt,
        }),
      };
    };
  const projects = sources.projects.filter((project) => project.title).map(toProject);
  const featured = sources.featured.filter((project) => project.title).map(toProject);

  const assetCategory = sources.serviceCategories.find((category) => category.kind === "asset_management");
  const capabilityItems = (assetCategory?.services.map((service) => service.title).filter((title): title is string => Boolean(title)) ?? []).slice(0, 3);
  const servicesFeaturedImage = toImageAsset(SITE_IMAGES.building, locale);

  const highlights: HomeServiceHighlight[] = serviceHighlightsSchema
    .parse(sources.home.blocks.service_highlights ?? {})
    .items.filter((item) => item.title)
    .map((item, index) => ({
      number: item.number,
      icon: isIconName(item.icon) ? item.icon : "building",
      title: item.title as string,
      description: item.description,
      href: item.href,
      ...(index === 0 ? { capabilityItems, featuredImage: servicesFeaturedImage } : {}),
    }));

  return {
    locale,
    copy,
    heroStats: pick(HERO_STAT_KEYS).map((stat) => ({ ...stat, label: copy.hero.stat_labels[stat.key] ?? stat.label })),
    stats: pick(PROFILE_STAT_KEYS),
    groupExperience: statsByKey.get("group_experience")?.value,
    highlights,
    servicesFeaturedImage,
    sectors: HOME_SECTOR_SLUGS.map((slug) => sources.sectors.find((sector) => sector.slug === slug))
      .filter((sector): sector is { slug: string; name: string; projectsCount: number } => Boolean(sector?.name && sector.projectsCount > 0)),
    projects,
    featured,
    coverage: groupRegions(sources.regions.map((region) => ({ slug: region.slug, name: region.name }))),
    certificates: sources.certificates
      .filter((document) => document.standardCode)
      .map((document) => {
        const code = shortStandardCode(document.standardCode as string);
        return {
          id: document.id,
          code,
          label: document.title,
          expired: document.isExpired,
          image: certificateScan(document.slug ?? code) ?? certificateScan(code),
        };
      }),
    partners: partnerCards(sources.partners),
    profilePdfUrl: sources.settings.profilePdfUrl,
    organization: {
      name: sources.settings.companyLegalName,
      email: sources.settings.contact.email,
      telephone: sources.settings.contact.phones[0],
    },
  };
}

export type HomeView = ReturnType<typeof buildHomeView>;
