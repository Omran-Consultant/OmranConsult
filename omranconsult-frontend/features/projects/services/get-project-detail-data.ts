import { ApiError } from "@/lib/api/errors";
import { fetchPublicProjectBySlug } from "@/lib/api/public-content";
import { mapProjectDetailToUiModel } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";

export async function getProjectDetailData(locale: AppLocale, slug: string) {
  try {
    const payload = await fetchPublicProjectBySlug(locale, slug);
    return mapProjectDetailToUiModel(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
