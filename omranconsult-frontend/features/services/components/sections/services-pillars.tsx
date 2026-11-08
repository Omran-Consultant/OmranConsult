import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";
import { PILLAR_ICONS } from "@/features/services/services/services-view";

/** Figma Services "Pillars": three axis cards (icon, 01-03, title, the API service list); 01 is highlighted. */
export function ServicesPillars({ view }: { readonly view: ServicesView }) {
  const copy = view.copy.pillars;
  if (view.pillars.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="services-pillars-title" className="bg-canvas py-12 lg:py-32.5" data-section="pillars" id="pillars">
      <div className="container-page flex flex-col gap-6 lg:gap-14">
        {copy.title ? (
          <SectionHeader
            overline={copy.overline}
            overlineShort={copy.overline_short}
            className="max-md:[&>p:last-of-type]:hidden"
            subtitle={copy.subtitle}
            title={copy.title}
            titleId="services-pillars-title"
          />
        ) : null}
        <ol className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          {view.pillars.map((pillar, index) => {
            const highlighted = index === 0;
            return (
              <li
                className={classNames(
                  "flex flex-col gap-5 rounded-lg border p-8 lg:gap-6 lg:rounded-[24px]",
                  highlighted ? "glass border-line lg:border-line-accent lg:bg-accent-strong/12" : "glass border-line lg:bg-surface",
                )}
                data-reveal=""
                key={pillar.slug}
                style={{ "--reveal-index": index } as React.CSSProperties}
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-13 items-center justify-center rounded-[16px] bg-accent-strong text-green-300 lg:bg-accent-strong/18 lg:text-accent">
                    <Icon className="size-6" name={PILLAR_ICONS[index] ?? "layers"} />
                  </span>
                  <span aria-hidden="true" className="num-isolate font-latin text-overline text-muted lg:text-[2.5rem] lg:leading-tight lg:font-bold lg:tracking-normal lg:text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                {pillar.title ? <h3 className="font-display text-h2 text-primary">{pillar.title}</h3> : null}
                <ul className="flex flex-col border-t border-line">
                  {pillar.services.map((service) =>
                    service.title ? (
                      <li className="flex items-center gap-3 border-b border-line py-3.25 text-body-m text-secondary last:border-b-0" key={service.slug}>
                        <span aria-hidden="true" className="h-0.5 w-3.5 shrink-0 bg-accent" />
                        {service.title}
                      </li>
                    ) : null,
                  )}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
