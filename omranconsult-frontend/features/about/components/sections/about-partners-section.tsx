import { getTranslations } from "next-intl/server";

type PartnerRow = {
  readonly id: number;
  readonly name?: string;
  readonly field?: string;
};

type AboutPartnersSectionProps = {
  readonly partners: readonly PartnerRow[];
  readonly locale: import("@/i18n/routing").AppLocale;
};

export async function AboutPartnersSection({ locale, partners }: AboutPartnersSectionProps) {
  const t = await getTranslations({ locale, namespace: "AboutPage" });

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-navy px-(--oc-page-margin) py-(--oc-section-y) text-white" data-section="partners">
      <h2 className="font-display text-3xl font-bold text-brand-green-light">{t("partnersHeading")}</h2>
      <ul className="mt-10 columns-1 gap-8 text-lg leading-snug sm:columns-2 md:columns-3">
        {partners.map((partner) => (
          <li className="break-inside-avoid py-1" key={partner.id}>
            {partner.name}
            {partner.field ? (
              <span className="text-muted-on-dark">{`: ${partner.field}`}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
