import type { MetadataRoute } from "next";

import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { fetchPublicNews, fetchPublicProjects } from "@/lib/api/public-content";

const SITE_URL = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

const STATIC_ROUTES = ["", "/about", "/services", "/projects", "/contact", "/media"] as const;
const LOCALES = ["en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, news] = await Promise.all([fetchPublicProjects("en", { perPage: 100 }), fetchPublicNews("en", { perPage: 50 })]);
  const now = new Date();
  // Articles carry their publication date. Projects expose no public date (updated_at stays
  // internal by contract), so they and the static pages use the generation time.
  const routes: { path: string; lastModified: Date }[] = [
    ...STATIC_ROUTES.map((path) => ({ path, lastModified: now })),
    ...projects.data.map((project) => ({ path: `/projects/${project.slug}`, lastModified: now })),
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
