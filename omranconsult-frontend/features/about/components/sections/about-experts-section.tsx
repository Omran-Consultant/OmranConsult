import { ExpertsExplorer } from "@/features/about/components/experts-explorer";
import { asObject, asString } from "@/features/home/lib/block-helpers";
import type { AppLocale } from "@/i18n/routing";

type Expert = {
  readonly id: number;
  readonly slug: string;
  readonly name?: string;
  readonly title?: string;
  readonly bio?: string;
  readonly yearsExperience: number;
};

type AboutExpertsSectionProps = {
  readonly locale: AppLocale;
  readonly experts: readonly Expert[];
  readonly blocks: unknown;
};

export function AboutExpertsSection({ blocks, experts, locale }: AboutExpertsSectionProps) {
  const sectionTitles = asObject(
    typeof blocks === "object" && blocks !== null ? (blocks as Record<string, unknown>).section_titles : undefined,
  );
  const heading = asString(sectionTitles?.experts);

  return (
    <section className="bg-page px-(--oc-page-margin) py-(--oc-section-y)" data-section="experts" id="experts">
      <ExpertsExplorer experts={experts} heading={heading} locale={locale} />
    </section>
  );
}
