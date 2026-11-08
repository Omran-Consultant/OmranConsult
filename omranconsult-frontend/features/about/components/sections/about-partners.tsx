import { PartnerGrid } from "@/core/ui/partner-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/**
 * ✚ Partners (D5). The heading is the profile page title («شركاؤنا»). The divider slide
 * «شراكات نوعية» stays in the data and is not a second heading above the same four logos.
 */
export function AboutPartners({ view }: { readonly view: AboutView }) {
  const title = view.homeCopy.trust.partners_label;
  if (view.partners.length === 0 || !title) {
    return null;
  }

  return (
    <section aria-labelledby="about-partners-title" className="bg-surface py-section-y" data-section="partners" id="partners">
      <div className="container-page flex flex-col gap-section-gap">
        <SectionHeader overline={view.copy.partners.overline} subtitle={view.slides.partners?.subline} title={title} titleId="about-partners-title" />
        <PartnerGrid partners={view.partners} />
      </div>
    </section>
  );
}
