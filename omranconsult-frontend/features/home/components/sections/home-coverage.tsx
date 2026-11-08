import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "@/core/ui/section-header";
import type { HomeView } from "@/features/home/services/home-view";
import { SITE_IMAGES } from "@/features/media/profile-images";

/**
 * Figma Home "Coverage": map image and macro regions listing the API regions (plan §5). Project
 * counts are hidden: no project is linked to a region yet (Q6).
 */
export async function HomeCoverage({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home.coverage");
  const { coverage: copy } = view.copy;
  const image = SITE_IMAGES.worldmap;

  if (view.coverage.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-coverage-title" className="relative isolate bg-elevated py-16 lg:py-29" data-section="coverage">
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-transparent to-surface/60" />
      <div className="container-page grid items-center gap-10 lg:grid-cols-[520fr_720fr] lg:gap-10">
        <div className="flex flex-col gap-10" data-reveal="">
          {copy.title ? <SectionHeader overline={copy.overline} subtitle={copy.subtitle} title={copy.title} titleId="home-coverage-title" /> : null}
          <ul>
            {view.coverage.map((group) => (
              <li className="flex items-center justify-between gap-6 border-b border-line py-4" key={group.key}>
                <span className="font-display text-h4 text-primary">{t(group.key)}</span>
                <span className="text-end text-label-s text-accent">{group.regions.join(" · ")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative aspect-[3/2] overflow-hidden rounded-[24px] border border-line-strong bg-highlight" data-reveal="">
          <Image alt={image.alt[view.locale]} className="object-cover" fill sizes="(min-width: 1440px) 720px, (min-width: 1024px) 50vw, 100vw" src={image.src} />
        </div>
      </div>
    </section>
  );
}
