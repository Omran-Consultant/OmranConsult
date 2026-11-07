import { getTranslations } from "next-intl/server";

import { PageHero } from "@/core/ui/page-hero";
import { SECTION_BACKGROUND_IMAGES, toImageAsset } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type AboutHeaderSectionProps = {
  readonly locale: AppLocale;
  readonly title: string;
  readonly subline?: string;
};

export async function AboutHeaderSection({ locale, subline, title }: AboutHeaderSectionProps) {
  const t = await getTranslations("Layout");

  return (
    <div data-section="header">
      <PageHero
        breadcrumbLabel={t("breadcrumbLabel")}
        breadcrumbs={[{ label: t("nav.home"), href: "/" }, { label: title }]}
        image={toImageAsset(SECTION_BACKGROUND_IMAGES.about, locale)}
        intro={subline}
        title={title}
      />
    </div>
  );
}
