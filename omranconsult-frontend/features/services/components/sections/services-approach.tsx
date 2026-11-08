import { getTranslations } from "next-intl/server";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";

/**
 * Figma Services "Approach": the profile steps in the Step style (top rule, Montserrat number,
 * text; 01 in accent), then the expected outputs as a second row.
 */
export async function ServicesApproach({ view }: { readonly view: ServicesView }) {
  const t = await getTranslations("ServicesPage");
  const copy = view.copy.approach;
  const { steps, outputs, section_title: sectionTitle } = view.blocks.multi_phase_approach;
  const title = copy.title ?? sectionTitle;
  if (!title || steps.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="services-approach-title" className="bg-canvas py-12 lg:py-32.5" data-section="approach" id="approach">
      <div className="container-page flex flex-col gap-6 lg:gap-14">
        <SectionHeader
          className="max-md:[&>p:last-of-type]:hidden"
          overline={copy.overline}
          overlineShort={copy.overline_short}
          subtitle={copy.subtitle}
          title={title}
          titleShort={copy.title_short}
          titleId="services-approach-title"
        />
        <ol className="grid md:grid-cols-2 md:gap-x-6 md:gap-y-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              className={classNames(
                "flex items-center gap-4 border-b border-line py-4 md:flex-col md:items-start md:border-t md:border-b-0 md:pt-7 md:pb-0",
                index === 0 ? "md:border-accent" : "md:border-line-strong",
              )}
              data-reveal=""
              key={step}
              style={{ "--reveal-index": index % 3 } as React.CSSProperties}
            >
              <span className={classNames("num-isolate shrink-0 font-latin text-[2rem] leading-none font-bold max-md:order-last md:text-[3rem]", index === 0 ? "text-accent" : "text-muted")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="text-body-m text-primary md:text-secondary">{step}</p>
            </li>
          ))}
        </ol>
        {outputs.length > 0 ? (
          <div className="flex flex-col gap-5 rounded-lg border border-line bg-surface p-6 lg:p-8">
            <h3 className="font-display text-h3 text-primary">{t("outputsHeading")}</h3>
            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {outputs.map((output) => (
                <li className="flex items-start gap-3 text-body-s text-secondary" key={output}>
                  <Icon className="mt-1 size-4 shrink-0 text-accent" name="check" />
                  {output}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
