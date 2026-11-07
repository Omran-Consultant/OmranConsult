import { HomeExpertsPreview } from "@/features/home/components/home-experts-preview";
import { asObject, asString } from "@/features/home/lib/block-helpers";
import type { HomePageData } from "@/features/home/types/home-page-data";
import type { AppLocale } from "@/i18n/routing";

type HomeExpertsSectionProps = {
  readonly locale: AppLocale;
  readonly experts: HomePageData["experts"];
  readonly blocks: HomePageData["home"]["blocks"];
};

export function HomeExpertsSection({ blocks, experts, locale }: HomeExpertsSectionProps) {
  const sectionTitles = asObject(blocks.section_titles);
  const heading = asString(sectionTitles?.experts);

  return (
    <section className="bg-canvas px-page py-section-y" data-section="experts" id="experts">
      <HomeExpertsPreview experts={experts} heading={heading} locale={locale} />
    </section>
  );
}
