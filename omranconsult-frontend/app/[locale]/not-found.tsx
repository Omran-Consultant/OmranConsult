import { getLocale } from "next-intl/server";

import { NotFoundHero } from "@/features/layout/components/not-found-hero";
import type { AppLocale } from "@/i18n/routing";

export default async function LocaleNotFound() {
  const locale = (await getLocale()) as AppLocale;

  return <NotFoundHero locale={locale} />;
}
