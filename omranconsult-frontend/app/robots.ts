import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import { isIndexableHost } from "@/core/seo/indexing";
import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";

const SITE_URL = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";

/** Disallow-all unless this request is for the indexable production domain. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!isIndexableHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/cms"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
