import Image from "next/image";

import { Icon, type IconName } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

const STRATEGY_CARDS = [
  { key: "vision", icon: "mountain" },
  { key: "mission", icon: "send" },
  { key: "objectives", icon: "target" },
] as const satisfies readonly { readonly key: keyof AboutView["blocks"]["strategy"]; readonly icon: IconName }[];

/**
 * About strategy: three equal glass cards over the building photo.
 * Owner request 2026-11-08: the number sits with an outline icon, and the title sits under the number.
 * Photo, navy veil, type, and accent colour stay on the existing tokens.
 */
export function AboutStrategy({ view }: { readonly view: AboutView }) {
  const { strategy } = view.blocks;
  const cards = STRATEGY_CARDS.flatMap((item, index) => {
    const card = strategy[item.key];
    return card?.title ? [{ ...item, title: card.title, body: card.body, number: String(index + 1).padStart(2, "0") }] : [];
  });
  if (cards.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-strategy-title" className="scheme-dark relative isolate bg-surface pt-12 pb-12 text-primary lg:bg-canvas lg:pt-27.5 lg:pb-32.5" data-section="strategy" id="strategy">
      <Image alt="" className="-z-20 hidden object-cover lg:block" fill sizes="100vw" src={view.images.strategy.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-navy-950/82 lg:block" />
      <div className="container-page flex flex-col gap-6 lg:gap-12">
        {view.copy.strategy.title ? <SectionHeader overline={view.copy.strategy.overline} title={view.copy.strategy.title} titleId="about-strategy-title" /> : null}
        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, index) => (
            <li
              className="flex h-full flex-col gap-5 rounded-lg border border-line bg-canvas p-5 lg:glass lg:gap-6 lg:rounded-[24px] lg:border-line-strong lg:p-8"
              data-reveal=""
              key={card.key}
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-2 lg:gap-3">
                  <span className="num-isolate font-latin text-[2rem] leading-none font-bold text-accent lg:text-[3.5rem]">{card.number}</span>
                  <h3 className="font-display text-h3 text-primary lg:text-h2">{card.title}</h3>
                </div>
                <Icon className="mt-1 size-10 text-accent lg:mt-1 lg:size-14" name={card.icon} />
              </div>
              {card.body ? <p className="text-body-s text-secondary lg:text-body-m">{card.body}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
