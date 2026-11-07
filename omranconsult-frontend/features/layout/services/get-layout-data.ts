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

export async function getLayoutData(locale: AppLocale): Promise<LayoutData> {
  const [settingsPayload, pagePayload] = await Promise.all([
    fetchPublicSettings(locale),
    fetchPublicPage(locale, "layout"),
  ]);
  const settings = mapSettingsToUiModel(settingsPayload);
  const copy = layoutCopySchema.parse(mapPageToBlocks(pagePayload).design_copy ?? {});

  return {
    companyName: settings.companyLegalName,
    address: settings.contact.address,
    phones: settings.contact.phones,
    email: settings.contact.email,
    footerAbout: copy.footer.about,
    newsletterText: copy.footer.newsletter_text,
    tagline: copy.footer.tagline,
  };
}
