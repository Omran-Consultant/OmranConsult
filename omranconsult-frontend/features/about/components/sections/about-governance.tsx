import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Governance": header and the ESG text at the start, three pillar rows with chips. */
export function AboutGovernance({ view }: { readonly view: AboutView }) {
  const { esg } = view.blocks;
  const slide = view.slides.governance;
  const title = [slide?.headline, slide?.subline].filter(Boolean).join(" ") || esg.section_title;
  if (!title && esg.pillars.length === 0) {
    return null;
  }
  const [lead, ...more] = esg.body;

  return (
    <section aria-labelledby="about-esg-title" className="bg-canvas py-12 lg:py-32.5" data-section="governance" id="esg">
      <div className="container-page grid gap-8 lg:grid-cols-[500fr_700fr] lg:gap-20">
        <div className="flex flex-col gap-5" data-reveal="">
          {title ? <SectionHeader overline={view.copy.esg.overline} subtitle={lead} title={title} titleId="about-esg-title" /> : null}
          {more.map((paragraph) => (
            <p className="text-body-m text-secondary" key={paragraph.slice(0, 32)}>
              {paragraph}
            </p>
          ))}
        </div>
        <ul className="flex flex-col gap-4 lg:self-start">
          {esg.pillars.map((pillar, index) => (
            <li
              className="flex flex-col gap-4 rounded-lg border border-line bg-surface px-7 py-6 md:flex-row md:items-center md:justify-between"
              data-reveal=""
              key={`${pillar.title}-${index}`}
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <h3 className="flex items-center gap-3 font-display text-h3 text-primary">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-accent" />
                {pillar.title}
              </h3>
              <ul className="flex flex-wrap gap-2">
                {pillar.items.map((item) => (
                  <li className="rounded-full border border-line-strong px-3.5 py-1.5 text-label-s text-secondary" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
