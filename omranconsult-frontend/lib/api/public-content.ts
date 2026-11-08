import { cacheLife, cacheTag } from "next/cache";

import type { AppLocale } from "@/i18n/routing";
import {
  clientsResponseSchema,
  documentsResponseSchema,
  expertsResponseSchema,
  homeResponseSchema,
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
import { serverApiRequest } from "@/lib/api/server-client";

type ProjectsQuery = {
  client?: string;
  region?: string;
  sector?: string;
  q?: string;
  page?: number;
  perPage?: number;
};

function withLocaleHeaders(locale: AppLocale): HeadersInit {
  return {
    "Accept-Language": locale,
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
  cacheTag("settings");

  return settingsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/settings", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicHome(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("home");

  return homeResponseSchema.parse(
    await serverApiRequest<unknown>("/api/home", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export type PublicPageKey = "home" | "about" | "services" | "projects" | "contact" | "media" | "layout";

export async function fetchPublicPage(locale: AppLocale, page: PublicPageKey) {
  "use cache";
  cacheLife("hours");
  cacheTag("pages", `pages:${page}`);

  return pageResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/pages/${page}`, {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicServices(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("services");

  return servicesResponseSchema.parse(
    await serverApiRequest<unknown>("/api/services", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicProjects(locale: AppLocale, query?: ProjectsQuery) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");

  return projectsIndexResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/projects${buildProjectsQuery(query)}`, {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicProjectBySlug(locale: AppLocale, slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("projects");
  cacheTag(`project:${slug}`);

  return projectDetailResponseSchema.parse(
    await serverApiRequest<unknown>(`/api/projects/${slug}`, {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicClients(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("clients");

  return clientsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/clients", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicRegions(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("regions");

  return regionsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/regions", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicExperts(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("team");

  return expertsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/experts", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicOrgChart(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("team");

  return orgChartResponseSchema.parse(
    await serverApiRequest<unknown>("/api/org-chart", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicDocuments(locale: AppLocale, kind?: "iso_certificate" | "license") {
  "use cache";
  cacheLife("hours");
  cacheTag("documents");

  return documentsResponseSchema.parse(
    await serverApiRequest<unknown>(kind ? `/api/documents?kind=${kind}` : "/api/documents", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicPartners(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return partnersResponseSchema.parse(
    await serverApiRequest<unknown>("/api/partners", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}

export async function fetchPublicSectors(locale: AppLocale) {
  "use cache";
  cacheLife("hours");
  cacheTag("sectors");

  return sectorsResponseSchema.parse(
    await serverApiRequest<unknown>("/api/sectors", {
      headers: withLocaleHeaders(locale),
      cache: "force-cache",
    }),
  );
}
