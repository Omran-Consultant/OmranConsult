import type { MetadataRoute } from "next";

import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { fetchPublicProjects } from "@/lib/api/public-content";

const SITE_URL = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

const STATIC_ROUTES = ["", "/about", "/services", "/projects", "/contact"] as const;
const LOCALES = ["en", "ar"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await fetchPublicProjects("en", { perPage: 100 });
  const projectRoutes = projects.data.map((project) => `/projects/${project.slug}`);

  const routes = [...STATIC_ROUTES, ...projectRoutes];

  return routes.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}${route}`,
      alternates: {
        languages: {
          en: `${SITE_URL}/en${route}`,
          ar: `${SITE_URL}/ar${route}`,
          "x-default": `${SITE_URL}/en${route}`,
        },
      },
      lastModified: new Date(),
    })),
  );
}
