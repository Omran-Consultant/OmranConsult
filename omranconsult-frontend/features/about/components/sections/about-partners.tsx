import Image from "next/image";

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
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {view.partners.map((partner, index) => (
            <li
              className="glass flex flex-col gap-5 rounded-lg border border-line p-6"
              data-reveal=""
              key={partner.slug}
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <div className="flex h-24 items-center justify-center rounded-md bg-white px-6">
                {partner.logo ? (
                  <Image alt="" className="max-h-16 w-auto object-contain" height={partner.logo.height} sizes="200px" src={partner.logo.src} width={partner.logo.width} />
                ) : null}
              </div>
              <h3 className="font-display text-h4 text-primary">{partner.name}</h3>
              {partner.field ? <p className="text-body-s text-secondary">{partner.field}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
