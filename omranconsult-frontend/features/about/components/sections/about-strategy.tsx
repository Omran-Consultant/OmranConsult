import Image from "next/image";

import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Vision Mission": building photo under navy 82 %, three glass cards 01-03. */
export function AboutStrategy({ view }: { readonly view: AboutView }) {
  const { strategy } = view.blocks;
  const cards = [strategy.vision, strategy.mission, strategy.objectives].filter((card): card is { title?: string; body?: string } => Boolean(card?.title));
  if (cards.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-strategy-title" className="scheme-dark relative isolate bg-surface pt-12 pb-12 text-primary lg:bg-canvas lg:pt-27.5 lg:pb-32.5" data-section="strategy" id="strategy">
      <Image alt="" className="-z-20 hidden object-cover lg:block" fill sizes="100vw" src={view.images.strategy.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-navy-950/82 lg:block" />
      <div className="container-page flex flex-col gap-6 lg:gap-12">
        {view.copy.strategy.title ? <SectionHeader overline={view.copy.strategy.overline} title={view.copy.strategy.title} titleId="about-strategy-title" /> : null}
        <ul className="grid items-start gap-4 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, index) => (
            <li
              className="flex flex-col gap-2.5 rounded-lg border border-line bg-canvas p-5 lg:glass lg:gap-4.5 lg:rounded-[24px] lg:border-line-strong lg:p-8"
              data-reveal=""
              key={card.title}
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <div className="flex items-center justify-between gap-4 lg:flex-col-reverse lg:items-start lg:gap-4.5">
                <h3 className="font-display text-h3 text-primary lg:text-h2">{card.title}</h3>
                <span className="num-isolate font-latin text-[2rem] leading-tight font-bold text-accent lg:text-[3.5rem]">{String(index + 1).padStart(2, "0")}</span>
              </div>
              {card.body ? <p className="text-body-s text-secondary lg:text-body-m">{card.body}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
