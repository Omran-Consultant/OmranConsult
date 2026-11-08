import Image from "next/image";

import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";

/** Figma Services "Engineering & Design": truss photo under canvas 88 %, header, body, 12 numbered tiles. */
export function ServicesEngineering({ view }: { readonly view: ServicesView }) {
  const category = view.engineering;
  const copy = view.copy.engineering;
  const { body, section_title: sectionTitle } = view.blocks.engineering_design;
  const disciplines = (category?.services ?? []).filter((service) => service.title);
  const title = copy.title ?? sectionTitle ?? category?.title;
  if (!title || disciplines.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="services-engineering-title" className="scheme-dark relative isolate bg-canvas py-12 text-primary lg:py-30.75" data-section="engineering-and-design" id="engineering">
      <Image alt="" className="-z-20 object-cover" fill sizes="100vw" src={view.images.engineering.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-canvas/88" />
      <div className="container-page flex flex-col gap-6 lg:gap-10">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start lg:gap-20">
          <SectionHeader overline={copy.overline} title={title} titleId="services-engineering-title" />
          {body ? <p className="text-body-m text-secondary lg:pt-12">{body}</p> : null}
        </div>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-10">
          {disciplines.map((discipline, index) => (
            <li
              className="flex items-center gap-3.5 rounded-[18px] border border-line-strong bg-white/5 px-6 py-5 lg:py-6"
              data-reveal=""
              key={discipline.slug}
              style={{ "--reveal-index": index % 4 } as React.CSSProperties}
            >
              <span className="font-display text-h4 text-primary">{discipline.title}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-line-strong" />
              <span className="num-isolate font-latin text-overline text-accent">{String(index + 1).padStart(2, "0")}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
