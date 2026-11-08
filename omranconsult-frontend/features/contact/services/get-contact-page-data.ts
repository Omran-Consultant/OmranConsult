import { z } from "zod";

import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { mapPageToBlocks, mapServicesToUiModel, mapSettingsToUiModel } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicPage, fetchPublicServices, fetchPublicSettings } from "@/lib/api/public-content";

const text = z.string().trim().min(1).optional().catch(undefined);

/** Contact design copy (SDD P22, page `contact`). */
const contactCopySchema = z
  .object({ overline: text, title: text, intro: text, intro_short: text, form_title: text })
  .catch({});

export async function getContactPageData(locale: AppLocale) {
  const [page, services, settingsPayload] = await Promise.all([
    fetchPublicPage(locale, "contact"),
    fetchPublicServices(locale),
    fetchPublicSettings(locale),
  ]);
  const settings = mapSettingsToUiModel(settingsPayload);

  return {
    copy: contactCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}),
    contact: { ...settings.contact, workingHours: settings.workingHours },
    serviceOptions: mapServicesToUiModel(services).flatMap((category) =>
      category.title ? [{ value: category.slug, label: category.title }] : [],
    ),
    image: toImageAsset(SITE_IMAGES.aerial, locale),
  };
}

export type ContactView = Awaited<ReturnType<typeof getContactPageData>>;
