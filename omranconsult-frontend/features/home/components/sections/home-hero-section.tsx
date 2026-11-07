import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { splitDisplayHeadline } from "@/features/home/lib/block-helpers";
import { HERO_SLIDE_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import Image from "next/image";

type HeroSlide = {
  readonly key: string;
  readonly headline?: string;
  readonly subline?: string;
};

type HomeHeroSectionProps = {
  readonly locale: AppLocale;
  readonly heroSlide?: HeroSlide;
  readonly coverSlide?: HeroSlide;
};

const SWATCH_LINKS = [
  { href: "/about", labelKey: "about", className: "bg-surface-muted text-brand-navy" },
  { href: "/services", labelKey: "services", className: "bg-brand-green-light text-brand-navy-deep" },
  { href: "/projects", labelKey: "projects", className: "bg-brand-green-strong text-white" },
  { href: "/#credentials", labelKey: "credentials", className: "bg-brand-navy text-white" },
  { href: "/#contact", labelKey: "contact", className: "bg-brand-navy-deep text-white" },
] as const;

export async function HomeHeroSection({ coverSlide, heroSlide, locale }: HomeHeroSectionProps) {
  const layoutT = await getTranslations("Layout.nav");
  const homeT = await getTranslations("HomePage");
  const headline = heroSlide?.headline ?? "";
  const lines = headline ? splitDisplayHeadline(headline) : [];
  const earth = HERO_SLIDE_IMAGES.hero;

  return (
    <section className="home-hero grid min-h-svh grid-cols-1 gap-2.5 bg-page p-2.5 md:min-h-[640px] md:grid-cols-[minmax(0,10fr)_minmax(0,2fr)]" data-section="hero">
      <div className="hero-view relative flex min-h-[min(100svh,640px)] flex-col justify-between overflow-hidden rounded-(--oc-radius-brand) bg-brand-navy-deep p-7 text-white">
        <Image
          alt={getProfileImageAlt(earth, locale)}
          className="hero-drift absolute inset-0 h-full w-full object-cover object-[30%_50%]"
          fill
          priority
          sizes="100vw"
          src={earth.src}
        />
        <div aria-hidden className="absolute inset-0 bg-brand-navy-deep/40" />

        <div className="relative z-1 flex items-start justify-between gap-6">
          <BrandLogo
            alt={layoutT("home")}
            className="h-auto w-[clamp(150px,13vw,210px)]"
            priority
            surface="onDark"
          />
          {coverSlide?.headline ? (
            <p className="max-w-[16ch] text-end text-sm leading-snug font-medium text-muted-on-dark">{coverSlide.headline}</p>
          ) : null}
        </div>

        {lines.length > 0 ? (
          <h1 className="font-display relative z-1 max-w-[11ch] text-(--text-oc-display) leading-[1.08] font-extrabold text-white">
            {lines.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
          </h1>
        ) : null}

        <div className="relative z-1 flex flex-wrap items-end justify-between gap-6">
          {heroSlide?.subline ? (
            <p className="max-w-[34ch] text-(--text-oc-lead) leading-snug text-muted-on-dark">{heroSlide.subline}</p>
          ) : null}
          <LinkButton
            className="rounded-full bg-white px-7 text-brand-navy hover:bg-brand-green-light hover:text-brand-navy-deep"
            href="/#contact"
            variant="solid"
          >
            {homeT("contactCta")}
          </LinkButton>
        </div>
      </div>

      <nav aria-label={layoutT("primaryLabel")} className="swatch-nav grid grid-rows-5 overflow-hidden rounded-(--oc-radius-brand) md:grid-rows-5">
        {SWATCH_LINKS.map((item) => (
          <Link
            className={`flex items-center px-5 py-5 text-base font-bold transition-[padding] duration-300 hover:pt-7.5 ${item.className}`}
            href={item.href}
            key={item.href}
          >
            {item.labelKey === "credentials" ? homeT("credentialsNav") : layoutT(item.labelKey)}
          </Link>
        ))}
      </nav>
    </section>
  );
}
