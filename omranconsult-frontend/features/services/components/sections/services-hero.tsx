import { getTranslations } from "next-intl/server";

import { PageHero } from "@/core/ui/page-hero";
import type { ServicesView } from "@/features/services/services/get-services-page-data";

/** Figma Services "Page Hero" (600 desktop, 460 mobile; CAD photo under the strong start scrim). */
export async function ServicesHero({ view }: { readonly view: ServicesView }) {
  const t = await getTranslations("Layout");
  const { hero } = view.copy;

  return (
    <PageHero
      breadcrumbLabel={t("breadcrumbLabel")}
      breadcrumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.services") }]}
      heightClassName="min-h-115 lg:min-h-150"
      image={view.images.hero}
      intro={hero.intro}
      introShort={hero.intro_short}
      scrim="scrim-start-strong"
      title={hero.title ?? t("nav.services")}
    />
  );
}
