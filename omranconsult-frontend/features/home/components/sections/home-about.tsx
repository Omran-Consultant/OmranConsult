import Image from "next/image";

import { LinkButton } from "@/core/ui/button";
import { CountUp } from "@/core/ui/count-up";
import { SectionHeader } from "@/core/ui/section-header";
import type { HomeView } from "@/features/home/services/home-view";
import { SITE_IMAGES } from "@/features/media/profile-images";

const ARCH = "rounded-t-[250px] rounded-b-lg";

/** Figma Home "About": arch photo with outline and glass badge, header, three facts, link. */
export function HomeAbout({ view }: { readonly view: HomeView }) {
  const { about } = view.copy;
  const image = SITE_IMAGES.engineer;

  return (
    <section aria-labelledby="home-about-title" className="bg-canvas pt-6 pb-16 lg:pt-10 lg:pb-35" data-section="about">
      <div className="container-page grid gap-6 lg:grid-cols-[624fr_560fr] lg:gap-24">
        <div className="flex flex-col gap-9" data-reveal="">
          {about.title ? (
            <SectionHeader overline={about.overline} subtitle={about.intro} title={about.title} titleId="home-about-title" />
          ) : null}
          {about.features.length > 0 ? (
            <ul className="hidden lg:block">
              {about.features.map((feature) => (
                <li className="flex gap-5 border-t border-line py-5.5" key={feature.title}>
                  <span aria-hidden="true" className="mt-5.5 size-2.5 shrink-0 rounded-full bg-accent" />
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-h4 text-primary">{feature.title}</span>
                    {feature.text ? <span className="text-body-s text-secondary">{feature.text}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {about.link ? (
            <LinkButton arrow className="self-start" href="/about" variant="secondary">
              {about.link}
            </LinkButton>
          ) : null}
        </div>

        <div className="relative order-first h-105 lg:order-none lg:h-165 lg:w-140" data-reveal="">
          <span aria-hidden="true" className={`absolute top-5 hidden h-160 w-125 border border-accent lg:start-5 lg:block ${ARCH}`} />
          <div className={`absolute inset-0 overflow-hidden bg-highlight lg:start-0 lg:end-auto lg:h-160 lg:w-125 ${ARCH}`}>
            <Image alt={image.alt[view.locale]} className="object-cover" fill sizes="(min-width: 1024px) 500px, 100vw" src={image.src} />
          </div>
          {view.groupExperience ? (
            <div className="glass absolute end-0 top-117.5 hidden w-56 flex-col gap-1.5 rounded-[18px] border border-line-strong bg-elevated/85 px-6 py-5 lg:flex">
              <CountUp className="font-display text-number-m text-accent" value={view.groupExperience} />
              {about.badge_label ? <span className="text-body-s text-secondary">{about.badge_label}</span> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
