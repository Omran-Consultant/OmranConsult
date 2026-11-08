import { getTranslations } from "next-intl/server";

import { PageHero } from "@/core/ui/page-hero";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Page Hero" (620 desktop, 500 mobile; facade photo, scrim 70 % → 100 %). */
export async function AboutHero({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("Layout");
  const vision = view.slides.vision;
  const title = view.copy.hero.title ?? [vision?.headline, vision?.subline].filter(Boolean).join("\n");
  const label = view.blocks.about.heading ?? t("nav.about");

  return (
    <PageHero
      breadcrumbLabel={t("breadcrumbLabel")}
      breadcrumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.about") }]}
      image={view.images.hero}
      intro={view.copy.hero.intro}
      introShort={view.copy.hero.intro_short}
      scrim="scrim-down-70"
      title={title || label}
    />
  );
}
