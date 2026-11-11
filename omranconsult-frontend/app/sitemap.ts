import type { MetadataRoute } from "next";

import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { fetchPublicNews, fetchPublicProjects } from "@/lib/api/public-content";

const SITE_URL = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

const STATIC_ROUTES = ["", "/about", "/services", "/projects", "/contact", "/media"] as const;
const LOCALES = ["en", "ar"] as const;

/** An absent or unparsable API date falls back to the generation time at the call site. */
function toDate(value: string | null | undefined): Date | undefined {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(time) ? undefined : new Date(time);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news] = await Promise.all([fetchPublicProjects("en", { perPage: 100 }), fetchPublicNews("en", { perPage: 50 })]);
  const now = new Date();
  // Articles carry their publication date and projects their last change (`updated_at`, public
  // since 2026-11-11). Static pages have no content date, so they use the generation time.
  const routes: { path: string; lastModified: Date }[] = [
    ...STATIC_ROUTES.map((path) => ({ path, lastModified: now })),
    ...projects.data.map((project) => ({ path: `/projects/${project.slug}`, lastModified: toDate(project.updated_at) ?? now })),
    ...news.data.map((post) => ({ path: `/media/${post.slug}`, lastModified: post.date ? new Date(post.date) : now })),
  ];

  return routes.flatMap(({ path: route, lastModified }) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${route}`,
          ar: `${SITE_URL}/ar${route}`,
          "x-default": `${SITE_URL}/en${route}`,
        },
      },
      lastModified,
    })),
  );
}
