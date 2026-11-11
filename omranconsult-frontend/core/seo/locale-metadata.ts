import type { Metadata } from "next";

import type { AppLocale } from "@/i18n/routing";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * Public site origin from env only. Undefined when NEXT_PUBLIC_SITE_URL is not set
 * (avoids treating localhost as an implicit production metadata base).
 */
export function getConfiguredPublicSiteOrigin(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? trimTrailingSlash(configured) : undefined;
}

export function getPublicMetadataBase(): URL | undefined {
  // `next dev` without NEXT_PUBLIC_SITE_URL serves localhost; say so instead of letting Next warn.
  const origin =
    getConfiguredPublicSiteOrigin() ??
    (process.env.NODE_ENV === "development" ? `http://localhost:${process.env.PORT ?? "3000"}` : undefined);
  if (!origin) {
    return undefined;
  }

  try {
    return new URL(origin);
  } catch {
    return undefined;
  }
}

type LocaleAlternateFields = Pick<
  NonNullable<Metadata["alternates"]>,
  "canonical" | "languages"
>;

/**
 * Canonical and hreflang for one route. `path` is the route without the locale
 * ("" for Home, "/about", "/projects/some-slug"). Each page declares its own path so a
 * page is never canonical to Home.
 */
export function buildPublicLocaleAlternates(
  locale: AppLocale,
  path = "",
): LocaleAlternateFields {
  const origin = getConfiguredPublicSiteOrigin() ?? "";

  return {
    canonical: `${origin}/${locale}${path}`,
    languages: {
      en: `${origin}/en${path}`,
      ar: `${origin}/ar${path}`,
      "x-default": `${origin}/en${path}`,
    },
  };
}

/** `generateMetadata` result for a page that only needs its own canonical and hreflang. */
export function routeAlternatesMetadata(locale: string, path = ""): Metadata {
  if (locale !== "en" && locale !== "ar") {
    return {};
  }

  const alternates = buildPublicLocaleAlternates(locale, path);
  const origin = getConfiguredPublicSiteOrigin();

  return {
    alternates,
    ...(origin ? { openGraph: { url: `${origin}/${locale}${path}` } } : {}),
  };
}
