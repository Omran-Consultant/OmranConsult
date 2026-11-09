import { cacheLife, cacheTag } from "next/cache";

import type { AppLocale } from "@/i18n/routing";
import {
  clientsResponseSchema,
  documentsResponseSchema,
  expertsResponseSchema,
  homeResponseSchema,
  newsCategoriesResponseSchema,
  newsDetailResponseSchema,
  newsIndexResponseSchema,
  pageResponseSchema,
  orgChartResponseSchema,
  partnersResponseSchema,
  projectDetailResponseSchema,
  projectsIndexResponseSchema,
  regionsResponseSchema,
  sectorsResponseSchema,
  servicesResponseSchema,
  settingsResponseSchema,
} from "@/features/public-content/schemas/public-api-schemas";
import { ApiError } from "@/lib/api/errors";
import { serverApiRequest } from "@/lib/api/server-client";

type ProjectsQuery = {
  featured?: boolean;
  client?: string;
  region?: string;
  sector?: string;
  q?: string;
  page?: number;
  perPage?: number;
};

/**
 * Detail fetchers return null on 404 inside the cached function: an error thrown across a
 * "use cache" boundary is serialized and is no longer an ApiError instance for the caller.
 */
async function nullOnNotFound<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

function withLocaleHeaders(locale: AppLocale): HeadersInit {
  return {
    "Accept-Language": locale,
  };
}

/** Tag the fetch Data Cache with the same tags as `"use cache"`, or `revalidateTag` only expires the function cache and this layer keeps serving the previous API JSON. */
function taggedCache(locale: AppLocale, tags: string[]) {
  return {
    headers: withLocaleHeaders(locale),
    cache: "force-cache" as const,
    next: { tags },
  };
}

function buildProjectsQuery(query: ProjectsQuery = {}): string {
  const params = new URLSearchParams();

  if (query.client) {
    params.set("client", query.client);
  }
  if (query.region) {
    params.set("region", query.region);
  }
  if (query.featured) {
    params.set("featured", "1");
  }
  if (query.sector) {
    params.set("sector", query.sector);
  }
  if (query.q) {
    params.set("q", query.q);
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.perPage) {
    params.set("per_page", String(query.perPage));
  }

  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

export async function fetchPublicSettings(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("settings", "footer");

  return settingsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/settings", taggedCache(locale, ["settings", "footer"])),
  );
}

export async function fetchPublicHome(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("home");

  return homeResponseSchema.parse(
    await serverApiRequest<unknown>("/api/home", taggedCache(locale, ["home"])),
  );
}

export type PublicPageKey = "home" | "about" | "services" | "projects" | "contact" | "media" | "layout";

export async function fetchPublicPage(locale: AppLocale, page: PublicPageKey) {
  "use cache";
  cacheLife("hours");
  const tags = ["pages", `pages:${page}`];
  if (page === "contact") {
    tags.push("contact");
  }
  if (page === "layout") {
    tags.push("footer");
  }
  cacheTag(...tags);

  return pageResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/pages/${page}`, taggedCache(locale, tags)),
  );
}

export async function fetchPublicServices(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  return servicesResponseSchema.parse(
    await serverApiRequest<unknown>("/api/services", taggedCache(locale, ["services"])),
  );
}

export async function fetchPublicProjects(locale: AppLocale, query?: ProjectsQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");

  return projectsIndexResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/projects${buildProjectsQuery(query)}`, taggedCache(locale, ["projects"])),
  );
}

export async function fetchPublicProjectBySlug(locale: AppLocale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  cacheTag(`project:${slug}`);

  const payload = await nullOnNotFound(
    serverApiRequest<unknown>(`/api/projects/${slug}`, taggedCache(locale, ["projects", `project:${slug}`])),
  );
  return payload === null ? null : projectDetailResponseSchema.parse(payload);
}

export async function fetchPreviewProjectBySlug(locale: AppLocale, slug: string, previewToken: string) {
  const payload = await nullOnNotFound(
    serverApiRequest<unknown>(`/api/projects/${slug}`, {
      headers: {
        ...withLocaleHeaders(locale),
        "X-Preview-Token": previewToken,
      },
      cache: "no-store",
    }),
  );
  return payload === null ? null : projectDetailResponseSchema.parse(payload);
}

export async function fetchPublicClients(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("clients");

  return clientsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/clients", taggedCache(locale, ["clients"])),
  );
}

export async function fetchPublicRegions(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("regions");

  return regionsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/regions", taggedCache(locale, ["regions"])),
  );
}

export async function fetchPublicExperts(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("team");

  return expertsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/experts", taggedCache(locale, ["team"])),
  );
}

export async function fetchPublicOrgChart(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("team");

  return orgChartResponseSchema.parse(
    await serverApiRequest<unknown>("/api/org-chart", taggedCache(locale, ["team"])),
  );
}

export async function fetchPublicDocuments(locale: AppLocale, kind?: "iso_certificate" | "license") {
  "use cache";
  cacheLife("hours");
  cacheTag("documents");

  return documentsResponseSchema.parse(
    await serverApiRequest<unknown>(kind ? `/api/documents?kind=${kind}` : "/api/documents", taggedCache(locale, ["documents"])),
  );
}

export async function fetchPublicPartners(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return partnersResponseSchema.parse(
    await serverApiRequest<unknown>("/api/partners", taggedCache(locale, ["partners"])),
  );
}

export async function fetchPublicSectors(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("sectors");

  return sectorsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/sectors", taggedCache(locale, ["sectors"])),
  );
}

export type NewsQuery = {
  category?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
};

function buildNewsQuery(query: NewsQuery = {}): string {
  const params = new URLSearchParams();
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.featured !== undefined) {
    params.set("featured", query.featured ? "1" : "0");
  }
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.perPage) {
    params.set("per_page", String(query.perPage));
  }
  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

export async function fetchPublicNewsCategories(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("news");

  return newsCategoriesResponseSchema.parse(
    await serverApiRequest<unknown>("/api/news-categories", taggedCache(locale, ["news"])),
  );
}

export async function fetchPublicNews(locale: AppLocale, query?: NewsQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag("news");

  return newsIndexResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/news${buildNewsQuery(query)}`, taggedCache(locale, ["news"])),
  );
}

export async function fetchPublicNewsPost(locale: AppLocale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("news");
  cacheTag(`news:${slug}`);

  const payload = await nullOnNotFound(
    serverApiRequest<unknown>(
      `/api/news/${encodeURIComponent(slug)}`,
      taggedCache(locale, ["news", `news:${slug}`]),
    ),
  );
  return payload === null ? null : newsDetailResponseSchema.parse(payload);
}
