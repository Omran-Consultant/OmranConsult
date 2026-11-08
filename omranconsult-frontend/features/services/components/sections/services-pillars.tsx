import { getTranslations } from "next-intl/server";

import { AxisCard } from "@/core/ui/service-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";
import { PILLAR_ICONS } from "@/features/services/services/services-view";

/** Three axis cards in the service-card shell. The first axis is the featured surface. */
export async function ServicesPillars({ view }: { readonly view: ServicesView }) {
  const copy = view.copy.pillars;
  const t = await getTranslations("ServicesPage");
  if (view.pillars.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="services-pillars-title" className="bg-canvas py-12 lg:py-32.5" data-section="pillars" id="pillars">
      <div className="container-page flex flex-col gap-6 lg:gap-14">
        {copy.title ? (
          <SectionHeader
            className="max-md:[&>p:last-of-type]:hidden"
            overline={copy.overline}
            overlineShort={copy.overline_short}
            subtitle={copy.subtitle}
            title={copy.title}
            titleId="services-pillars-title"
          />
        ) : null}
        <ol className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {view.pillars.map((pillar, index) => {
            const items = pillar.services.flatMap((service) => (service.title ? [service.title] : []));
            return (
              <li className="h-full min-w-0" data-reveal="" key={pillar.slug} style={{ "--reveal-index": index } as React.CSSProperties}>
                <AxisCard
                  countLabel={t("itemCount", { count: items.length })}
                  featured={index === 0}
                  icon={PILLAR_ICONS[index] ?? "layers"}
                  items={items}
                  number={String(index + 1).padStart(2, "0")}
                  title={pillar.title ?? ""}
                />
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
