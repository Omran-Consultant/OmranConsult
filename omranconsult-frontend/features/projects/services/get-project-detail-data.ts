import { mapProjectDetailToUiModel, mapProjectsIndexToUiModel } from "@/features/public-content/services/public-content-mappers";
import { ApiError } from "@/lib/api/errors";
import { fetchPublicProjectBySlug, fetchPublicProjects } from "@/lib/api/public-content";
import type { AppLocale } from "@/i18n/routing";

export async function getProjectDetailData(locale: AppLocale, slug: string) {
  try {
    const payload = await fetchPublicProjectBySlug(locale, slug);
    const project = mapProjectDetailToUiModel(payload);

    if (!project.client?.slug) {
      return { ...project, relatedProjects: [] as const };
    }

    const relatedPayload = await fetchPublicProjects(locale, {
      client: project.client.slug,
      perPage: 50,
    });
    const relatedIndex = mapProjectsIndexToUiModel(relatedPayload);
    const relatedProjects = relatedIndex.projects.filter((item) => item.slug !== slug);

    return { ...project, relatedProjects };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
