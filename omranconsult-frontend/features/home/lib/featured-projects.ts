import { PROFILE_IMAGES } from "@/features/media/profile-images";

type ProjectItem = {
  readonly slug: string;
  readonly title?: string;
  readonly client?: {
    readonly slug?: string;
    readonly name?: string;
  };
};

export type EntityProjectGroup = {
  readonly clientSlug?: string;
  readonly clientName?: string;
  readonly projects: readonly ProjectItem[];
};

const GROUP_IMAGE_KEYS = ["clarifier", "campus", "riyadhDay", "kafd", "plant"] as const;

export function groupFeaturedProjects(
  projects: readonly ProjectItem[],
  clientSortOrder: ReadonlyMap<string, number>,
  limit?: number,
): EntityProjectGroup[] {
  const groups = new Map<string, EntityProjectGroup>();

  for (const project of projects) {
    const slug = project.client?.slug ?? `unknown-${project.slug}`;
    const existing = groups.get(slug);
    if (existing) {
      groups.set(slug, {
        ...existing,
        projects: [...existing.projects, project],
      });
      continue;
    }
    groups.set(slug, {
      clientSlug: project.client?.slug,
      clientName: project.client?.name,
      projects: [project],
    });
  }

  const sorted = Array.from(groups.values()).sort((a, b) => {
    const aOrder = a.clientSlug ? (clientSortOrder.get(a.clientSlug) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
    const bOrder = b.clientSlug ? (clientSortOrder.get(b.clientSlug) ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });

  if (limit === undefined) {
    return sorted;
  }

  return sorted.slice(0, limit);
}

export function featuredProjectImage(index: number) {
  const key = GROUP_IMAGE_KEYS[index % GROUP_IMAGE_KEYS.length] ?? "clarifier";
  return PROFILE_IMAGES[key];
}

export const PROJECT_LAYOUT_CLASS = ["home-proj-a", "home-proj-b", "home-proj-c"] as const;
