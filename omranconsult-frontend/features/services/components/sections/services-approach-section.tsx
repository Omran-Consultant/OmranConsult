import { getTranslations } from "next-intl/server";

import { ServicesApproachOutputsRow } from "@/features/services/components/services-approach-outputs-row";

type ServicesApproachSectionProps = {
  readonly heading?: string;
  readonly steps: readonly string[];
  readonly outputs: readonly string[];
};

export async function ServicesApproachSection({ heading, outputs, steps }: ServicesApproachSectionProps) {
  const t = await getTranslations("ServicesPage");

  return (
    <section className="overflow-hidden px-(--oc-page-margin) pt-(--oc-section-y) pb-(--oc-section-y)" data-section="approach">
      {heading ? (
        <h2 className="font-display text-(--text-oc-h2) leading-tight font-bold text-heading">{heading}</h2>
      ) : null}

      {steps.length > 0 ? (
        <ul className="mt-6 grid max-w-300 gap-3 md:grid-cols-2 md:gap-x-12">
          {steps.map((step) => (
            <li className="relative ps-5.5 text-base leading-relaxed text-muted" key={step}>
              <span
                aria-hidden
                className="absolute start-0 top-[0.7em] size-2 rounded-full bg-brand-green-strong"
              />
              {step}
            </li>
          ))}
        </ul>
      ) : null}

      {outputs.length > 0 ? (
        <>
          <h3 className="sr-only">{t("outputsHeading")}</h3>
          <ServicesApproachOutputsRow
            ariaLabel={t("outputsRowLabel")}
            nextLabel={t("outputsRowNext")}
            outputs={outputs}
            previousLabel={t("outputsRowPrevious")}
          />
        </>
      ) : null}
    </section>
  );
}
