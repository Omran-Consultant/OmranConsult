import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { AccentText } from "@/core/ui/accent-text";
import { CountUp } from "@/core/ui/count-up";
import { Overline } from "@/core/ui/overline";
import { HeroRings } from "@/features/home/components/hero-rings";
import type { HomeView } from "@/features/home/services/home-view";
import { SITE_IMAGES } from "@/features/media/profile-images";

/** Figma Home "Hero" (940 desktop, 760 laptop, 780 mobile). Text sits on photos: always dark. */
export async function HomeHero({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { hero } = view.copy;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="scheme-dark relative isolate flex min-h-195 flex-col overflow-hidden bg-canvas text-primary lg:min-h-190 xl:min-h-235"
      data-section="hero"
    >
      {/* Desktop layers from OMRAN.fig: earth2 at 35 % opacity, then the "Shade" gradient. Mobile has neither. */}
      <Image alt="" className="-z-30 hidden object-cover opacity-35 lg:block" fill priority quality={40} sizes="100vw" src={SITE_IMAGES.earth2.src} />
      <span aria-hidden="true" className="hero-shade absolute inset-0 -z-20 hidden lg:block" />
      <HeroRings direction={view.locale === "ar" ? "rtl" : "ltr"} src={SITE_IMAGES.earth.src} />
      {/* "Bottom Fade" (desktop: last 260 px) and the mobile fade (from y 280, opaque at 60 %). */}
      <span aria-hidden="true" className="absolute inset-x-0 top-70 -z-10 h-125 bg-linear-to-b from-transparent to-canvas to-60% lg:hidden" />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-65 bg-linear-to-b from-transparent to-canvas lg:block" />

      <div className="container-page flex flex-1 flex-col justify-end pt-95 pb-10 lg:justify-start lg:pt-62.5 lg:pb-16">
        <div className="flex max-w-170 flex-col gap-5 lg:gap-8" data-reveal="">
          {hero.overline ? <Overline className="max-md:hidden">{hero.overline}</Overline> : null}
          {hero.overline_short ?? hero.overline ? <Overline className="md:hidden">{hero.overline_short ?? hero.overline ?? ""}</Overline> : null}
          {hero.headline ? (
            <h1 className="font-display text-display-xl" id="home-hero-title">
              <AccentText accentClassName="font-bold" value={hero.headline} />
            </h1>
          ) : null}
          {hero.lead ? <p className="text-body-l text-secondary max-md:hidden">{hero.lead}</p> : null}
          {hero.lead_short ?? hero.lead ? <p className="text-body-l text-secondary md:hidden">{hero.lead_short ?? hero.lead}</p> : null}
          <div className="flex flex-col gap-5 sm:flex-row sm:gap-4">
            {hero.cta_primary ? (
              <LinkButton arrow className="w-full sm:w-auto" href="/projects">
                {hero.cta_primary}
              </LinkButton>
            ) : null}
            {hero.cta_secondary ? (
              <LinkButton arrow className="w-full sm:w-auto" href="/about" variant="secondary">
                {hero.cta_secondary}
              </LinkButton>
            ) : null}
          </div>
        </div>
      </div>

      {/* In flow (not absolute) so a longer headline, as in English, pushes the bar down instead of overlapping it. */}
      <div className="container-page hidden pb-12 lg:block">
        <div className="flex items-end justify-between border-t border-line pt-6">
          {view.heroStats.length > 0 ? (
            <dl aria-label={t("heroStats")} className="flex gap-12">
              {view.heroStats.map((stat) => (
                <div className="flex flex-col-reverse gap-1" key={stat.key}>
                  {stat.label ? <dt className="text-caption text-muted">{stat.label}</dt> : null}
                  <dd>
                    <CountUp className="font-display text-number-m" value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <span />
          )}
          <p aria-hidden="true" className="flex items-center gap-3 self-center text-muted" dir="ltr">
            <span className="h-px w-14 bg-muted" />
            <span className="font-latin text-overline">{t("scroll")}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
