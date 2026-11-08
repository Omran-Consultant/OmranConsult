import { galleryImages } from "@/features/projects/services/projects-filters";
import { projectImage, projectsCopySchema, toProjectCards } from "@/features/projects/services/projects-view";
import { mapPageToBlocks, mapProjectDetailToUiModel } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicPage, fetchPublicProjectBySlug } from "@/lib/api/public-content";

export async function getProjectDetailData(locale: AppLocale, slug: string) {
  const [payload, page] = await Promise.all([fetchPublicProjectBySlug(locale, slug), fetchPublicPage(locale, "projects")]);
  if (!payload) {
    return null;
  }
  const project = mapProjectDetailToUiModel(payload);

  return {
    locale,
    copy: projectsCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}).detail,
    slug: project.slug,
    title: project.title,
    client: project.client?.name ? { slug: project.client.slug, name: project.client.name } : undefined,
    sector: project.sector?.name ? { slug: project.sector.slug, name: project.sector.name } : undefined,
    location: project.location,
    regions: project.regions.map((region) => region.name).filter((name): name is string => Boolean(name)),
    serviceType: project.serviceType,
    deliveryStatus: project.deliveryStatus,
    overview: project.overview,
    scope: project.scope,
    heroImage: projectImage(project.imageKey, locale),
    gallery: galleryImages(project.gallery, project.imageKey).map((key) => projectImage(key, locale)),
    related: toProjectCards(project.related, locale),
  };
}

export type ProjectDetailView = NonNullable<Awaited<ReturnType<typeof getProjectDetailData>>>;
