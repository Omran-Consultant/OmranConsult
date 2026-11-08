import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import { ServiceCard } from "@/core/ui/service-card";
import type { HomeView } from "@/features/home/services/home-view";
import { Link } from "@/i18n/navigation";

/** Figma Home "Services": bg/surface, header + «جميع الخدمات», six cards (three on mobile). */
export async function HomeServices({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { services: copy } = view.copy;

  if (view.highlights.length === 0) {
    return null;
  }

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
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {view.highlights.map((item, index) => (
            <li className={classNames(index >= 3 && "max-md:hidden")} data-reveal="" key={item.number} style={{ "--reveal-index": index % 3 } as React.CSSProperties}>
              <ServiceCard
                className="h-full min-h-70 lg:min-h-95"
                description={item.description}
                highlighted={index === 0}
                href={item.href}
                icon={item.icon}
                linkLabel={t("discover")}
                number={item.number}
                title={item.title}
              />
            </li>
          ))}
        </ul>
        <Link className="inline-flex items-center gap-3 self-start py-1.5 text-label-m text-accent md:hidden" href="/services">
          <span>{t("allServices")}</span>
          <Icon name="arrow" />
        </Link>
      </div>
    </section>
  );
}
