import Image from "next/image";

import { SectionHeader } from "@/core/ui/section-header";
import { StatItem } from "@/core/ui/stat-item";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Intro": header and the profile paragraphs, team photo with 21+ and 50+. */
export function AboutIntro({ view }: { readonly view: AboutView }) {
  const { about } = view.blocks;
  if (!about.heading && about.body.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-intro-title" className="bg-canvas py-12 lg:py-30" data-section="intro" id="about">
      <div className="container-page grid gap-6 lg:grid-cols-[664fr_520fr] lg:gap-24">
        <div className="flex flex-col gap-6" data-reveal="">
          {about.heading ? <SectionHeader overline={view.copy.intro.overline} title={about.heading} titleId="about-intro-title" /> : null}
          {about.body.map((paragraph) => (
            <p className="text-body-l text-secondary" key={paragraph.slice(0, 32)}>
              {paragraph}
            </p>
          ))}
        </div>
        <div className="flex flex-col gap-5" data-reveal="">
          <div className="relative aspect-[350/240] overflow-hidden rounded-lg bg-highlight lg:aspect-[520/380] lg:rounded-[24px]">
            <Image alt={view.images.team.alt} className="object-cover" fill sizes="(min-width: 1024px) 520px, 100vw" src={view.images.team.src} />
          </div>
          {view.introStats.length > 0 ? (
            <div className="hidden grid-cols-2 gap-5 lg:grid">
              {view.introStats.map((stat) => (
                <StatItem accent={stat.key === "group_experience"} key={stat.key} label={view.copy.intro.stat_labels[stat.key] ?? stat.label} value={stat.value} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
