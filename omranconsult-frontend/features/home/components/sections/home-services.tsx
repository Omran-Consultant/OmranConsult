import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { ServiceBentoCta, ServiceBentoFeatured, ServiceBentoStandard } from "@/core/ui/service-bento-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { IconName } from "@/core/ui/icon";
import type { HomeView } from "@/features/home/services/home-view";

/** Concept order 01–06: assets, consulting, supervision, design, digital, enablement. */
const SERVICE_ICONS = ["buildings", "hard-hat", "clipboard", "compass", "cpu", "graduation"] as const satisfies readonly IconName[];

/** Owner concept A (SITE_TWEAKS T3): four-column bento with featured service, white cards, and contact CTA. */
export async function HomeServices({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { services: copy, cta: homeCta } = view.copy;

  if (view.highlights.length === 0) {
    return null;
  }

  const [featured, ...rest] = view.highlights;
  const ctaTitle = homeCta.title ?? t("servicesCtaTitle");
  const ctaText = homeCta.text_short ?? homeCta.text;
  const ctaLink = homeCta.primary ?? t("servicesCtaLink");

  return (
    <section aria-labelledby="home-services-title" className="bg-surface py-16 lg:py-35" data-section="services">
      <div className="container-page flex flex-col gap-4 lg:gap-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" data-reveal="">
          {copy.title ? (
            <SectionHeader
              className="max-lg:[&_p:last-child]:hidden"
              overline={copy.overline}
              subtitle={copy.subtitle}
              title={copy.title}
              titleId="home-services-title"
            />
          ) : null}
          <div className="hidden lg:block">
            <LinkButton arrow href="/services" variant="secondary">
              {t("allServices")}
            </LinkButton>
          </div>
        </div>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          <li className="h-full min-w-0 sm:col-span-2 xl:col-span-2" data-reveal="">
            <ServiceBentoFeatured
              description={featured.description}
              href={featured.href}
              icon={SERVICE_ICONS[0] ?? featured.icon}
              image={featured.featuredImage ?? view.servicesFeaturedImage}
              items={featured.capabilityItems ?? []}
              linkLabel={t("discover")}
              number={featured.number}
              title={featured.title}
            />
          </li>
          {rest.map((item, index) => (
            <li className="h-full min-w-0" data-reveal="" key={item.number} style={{ "--reveal-index": index % 3 } as React.CSSProperties}>
              <ServiceBentoStandard
                description={item.description}
                href={item.href}
                icon={SERVICE_ICONS[index + 1] ?? item.icon}
                linkLabel={t("discover")}
                number={item.number}
                title={item.title}
              />
            </li>
          ))}
          <li className="h-full min-w-0" data-reveal="">
            <ServiceBentoCta description={ctaText} href="/contact" linkLabel={ctaLink} title={ctaTitle} />
          </li>
        </ul>
        <LinkButton arrow className="self-start md:hidden" href="/services" variant="secondary">
          {t("allServices")}
        </LinkButton>
      </div>
    </section>
  );
}
