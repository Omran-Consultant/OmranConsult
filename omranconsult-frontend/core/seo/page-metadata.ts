import type { Metadata } from "next";

import { buildPublicLocaleAlternates, getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import type { AppLocale } from "@/i18n/routing";

export const DEFAULT_OG_IMAGE = { url: "/images/og-default.jpg", width: 1200, height: 630 } as const;

type PageImage = { readonly url: string; readonly alt?: string; readonly width?: number; readonly height?: number };

type PageMetadataInput = {
  readonly locale: AppLocale;
  /** Route without the locale: "" for Home, "/about", "/projects/some-slug". */
  readonly path: string;
  /** Page name; the site name is appended unless this is the site name itself. */
  readonly title: string;
  readonly siteName: string;
  readonly description: string;
  /** The page's own image (project cover, article cover); the default share image otherwise. */
  readonly image?: PageImage;
  readonly type?: "website" | "article";
  readonly publishedTime?: string;
};

/** Collapses whitespace and shortens to a search-result length on a word boundary. */
export function summarize(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) {
    return flat;
  }
  const cut = flat.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

/**
 * Title, description, canonical, hreflang, Open Graph and Twitter for one public page (P4b).
 * Next replaces a parent's `openGraph` and `twitter` objects instead of merging them, so every
 * page states its image here.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { locale, path, siteName } = input;
  const title = input.title === siteName ? siteName : `${input.title} | ${siteName}`;
  const description = summarize(input.description);
  const image = input.image ?? { ...DEFAULT_OG_IMAGE, alt: siteName };
  const origin = getConfiguredPublicSiteOrigin();
  const images = [{ url: image.url, alt: image.alt ?? title, ...(image.width ? { width: image.width } : {}), ...(image.height ? { height: image.height } : {}) }];

  return {
    title,
    description,
    alternates: buildPublicLocaleAlternates(locale, path),
    openGraph: {
      title,
      description,
      siteName,
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      type: input.type ?? "website",
      ...(origin ? { url: `${origin}/${locale}${path}` } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((entry) => entry.url) },
  };
}
