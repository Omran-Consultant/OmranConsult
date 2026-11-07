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
  const origin = getConfiguredPublicSiteOrigin();
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

export function buildPublicLocaleAlternates(
  locale: AppLocale,
): LocaleAlternateFields {
  const origin = getConfiguredPublicSiteOrigin();

  if (origin) {
    return {
      canonical: `${origin}/${locale}`,
      languages: {
        en: `${origin}/en`,
        ar: `${origin}/ar`,
        "x-default": `${origin}/en`,
      },
    };
  }

  return {
    canonical: `/${locale}`,
    languages: {
      en: "/en",
      ar: "/ar",
      "x-default": "/en",
    },
  };
}
