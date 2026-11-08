import { SectionHeader } from "@/core/ui/section-header";
import { ExpertsGrid, type ExpertCardModel } from "@/features/about/components/experts-grid";
import type { AboutView } from "@/features/about/services/get-about-page-data";
import { EXPERT_PORTRAITS, toImageAsset } from "@/features/media/profile-images";

/** Figma About "Experts" with the real portraits (x-*.jpg); the initial is used without one. */
export function AboutExperts({ view }: { readonly view: AboutView }) {
  const experts: ExpertCardModel[] = view.experts
    .filter((expert) => expert.name)
    .map((expert) => {
      const portrait = EXPERT_PORTRAITS[expert.slug as keyof typeof EXPERT_PORTRAITS];
      const name = expert.name as string;
      return {
        slug: expert.slug,
        name,
        title: expert.title,
        bio: expert.bio,
        years: expert.yearsExperience,
        initial: name.replace(/^(د\.|د\/|Dr\.)\s*/, "").charAt(0),
        portrait: portrait ? toImageAsset(portrait, view.locale) : undefined,
      };
    });
  const title = view.blocks.section_titles.experts;
  if (experts.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-experts-title" className="bg-canvas py-12 md:bg-surface lg:py-32.5" data-section="experts" id="experts">
      <div className="container-page flex flex-col gap-5 lg:gap-14">
        {title ? (
          <SectionHeader
            className="max-md:[&>p:last-of-type]:hidden"
            overline={view.copy.experts.overline}
            subtitle={view.copy.experts.subtitle}
            title={title}
            titleId="about-experts-title"
          />
        ) : null}
        <ExpertsGrid experts={experts} />
      </div>
    </section>
  );
}
