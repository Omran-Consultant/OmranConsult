import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { mapPageToBlocks } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicPage, type PublicPageKey } from "@/lib/api/public-content";

const text = z.string().trim().min(1).optional().catch(undefined);
const introSchema = z
  .object({ hero: z.object({ intro: text }).catch({}).default({}), intro: text })
  .catch({ hero: {} });

const NAV_KEYS = {
  about: "about",
  services: "services",
  projects: "projects",
  media: "media",
  contact: "contact",
} as const satisfies Partial<Record<PublicPageKey, string>>;

export type PageSeo = { readonly siteName: string; readonly title: string; readonly description: string };

/** Site name and default description (messages), shared by every page's metadata. */
export async function getSiteSeo(locale: AppLocale): Promise<PageSeo> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { siteName: t("title"), title: t("title"), description: t("description") };
}

/**
 * A listing page's title is its navigation label; its description is the page intro from the
 * design copy (seeded with a design_copy_review dispute), or the site description without one.
 */
export async function getStaticPageSeo(locale: AppLocale, page: keyof typeof NAV_KEYS): Promise<PageSeo> {
  const [site, tLayout, payload] = await Promise.all([
    getSiteSeo(locale),
    getTranslations({ locale, namespace: "Layout" }),
    fetchPublicPage(locale, page),
  ]);
  const copy = introSchema.parse(mapPageToBlocks(payload).design_copy ?? {});

  return {
    siteName: site.siteName,
    title: tLayout(`nav.${NAV_KEYS[page]}`),
    description: copy.hero.intro ?? copy.intro ?? site.description,
  };
}
