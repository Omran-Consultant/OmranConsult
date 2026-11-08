import { z } from "zod";

import type { ImageAsset } from "@/core/ui/image-asset";
import { getSiteImage, SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import type { mapProjectsIndexToUiModel } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";

const text = z.string().trim().min(1).optional().catch(undefined);

/** Projects design copy (SDD P22, page `projects`): hero and the Project Details headings. */
export const projectsCopySchema = z
  .object({
    hero: z
      .object({ title: text, intro: text, intro_short: text, stat_labels: z.record(z.string()).catch({}).default({}) })
      .catch({ stat_labels: {} })
      .default({ stat_labels: {} }),
    detail: z
      .object({
        overview_overline: text,
        overview_title: text,
        scope_title: text,
        inquiry_title: text,
        inquiry_text: text,
        related_overline: text,
        related_title: text,
      })
      .catch({})
      .default({}),
  })
  .catch({ hero: { stat_labels: {} }, detail: {} });

export type ProjectsCopy = z.infer<typeof projectsCopySchema>;

/** Hero mini-stats in reading order (Figma Projects "Quick Stats"). */
export const PROJECTS_HERO_STAT_KEYS = ["completed_projects", "project_volume", "partnerships"];

export type ProjectCardModel = {
  readonly slug: string;
  readonly title: string;
  readonly client?: string;
  readonly category?: string;
  readonly image: ImageAsset;
};

type ProjectSummary = ReturnType<typeof mapProjectsIndexToUiModel>["projects"][number];

/** Card data for one API project; projects without a title are skipped by the callers. */
export function toProjectCard(project: ProjectSummary, locale: AppLocale): ProjectCardModel {
  return {
    slug: project.slug,
    title: project.title ?? project.slug,
    client: project.client?.name,
    category: project.sector?.name,
    image: projectImage(project.imageKey, locale),
  };
}

export function projectImage(key: string | undefined, locale: AppLocale): ImageAsset {
  return toImageAsset(getSiteImage(key) ?? SITE_IMAGES.building, locale);
}

export function toProjectCards(projects: readonly ProjectSummary[], locale: AppLocale): ProjectCardModel[] {
  return projects.filter((project) => project.title).map((project) => toProjectCard(project, locale));
}
