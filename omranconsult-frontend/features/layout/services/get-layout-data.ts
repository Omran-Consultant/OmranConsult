import { z } from "zod";

import type { AppLocale } from "@/i18n/routing";
import { fetchPublicPage, fetchPublicSettings } from "@/lib/api/public-content";
import { mapPageToBlocks, mapSettingsToUiModel } from "@/features/public-content/services/public-content-mappers";

const text = z.string().trim().min(1).optional().catch(undefined);

/** Layout design copy (SDD P22, page `layout`). Missing strings stay undefined. */
const layoutCopySchema = z
  .object({
    footer: z.object({ about: text, newsletter_text: text, tagline: text }).catch({}),
  })
  .catch({ footer: {} });

export type LayoutData = {
  readonly companyName?: string;
  readonly address?: string;
  readonly phones: readonly string[];
  readonly email?: string;
  readonly footerAbout?: string;
  readonly newsletterText?: string;
  readonly tagline?: string;
};

/** Safe empty shell when settings (or layout copy) cannot be loaded — no invented company facts. */
const FALLBACK_LAYOUT: LayoutData = {
  phones: [],
};

export async function getLayoutData(locale: AppLocale): Promise<LayoutData> {
  // Settled so a stalled settings fetch still leaves header/footer up for the localized error page.
  const [settingsResult, pageResult] = await Promise.allSettled([
    fetchPublicSettings(locale),
    fetchPublicPage(locale, "layout"),
  ]);

  if (settingsResult.status === "rejected" && pageResult.status === "rejected") {
    return FALLBACK_LAYOUT;
  }

  const settings =
    settingsResult.status === "fulfilled" ? mapSettingsToUiModel(settingsResult.value) : null;
  const copy =
    pageResult.status === "fulfilled"
      ? layoutCopySchema.parse(mapPageToBlocks(pageResult.value).design_copy ?? {})
      : { footer: {} as { about?: string; newsletter_text?: string; tagline?: string } };

  return {
    companyName: settings?.companyLegalName,
    address: settings?.contact.address,
    phones: settings?.contact.phones ?? [],
    email: settings?.contact.email,
    footerAbout: copy.footer.about,
    newsletterText: copy.footer.newsletter_text,
    tagline: copy.footer.tagline,
  };
}
