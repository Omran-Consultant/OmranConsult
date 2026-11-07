import type { MetadataRoute } from "next";

import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";

const SITE_URL = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
