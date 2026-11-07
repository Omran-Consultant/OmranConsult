import { getTranslations } from "next-intl/server";

import { Badge } from "@/core/ui/badge";
import { asObject, asString, asStringList } from "@/features/home/lib/block-helpers";
import type { HomePageData } from "@/features/home/types/home-page-data";
import type { AppLocale } from "@/i18n/routing";

type HomeCredentialsSectionProps = {
  readonly locale: AppLocale;
  readonly blocks: HomePageData["home"]["blocks"];
  readonly documents: HomePageData["documents"];
  readonly partners: HomePageData["partners"];
  readonly clients: HomePageData["clients"];
};

export async function HomeCredentialsSection({
  blocks,
  clients,
  documents,
  locale,
  partners,
}: HomeCredentialsSectionProps) {
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const aboutT = await getTranslations({ locale, namespace: "AboutPage" });
  const credentials = asObject(blocks.credentials);
  const sectionTitles = asObject(blocks.section_titles);
  const heading = asString(credentials?.heading) ?? asString(sectionTitles?.credentials);
  const intro =
    asString(credentials?.licenses_intro) ??
    asString(credentials?.intro) ??
    asStringList(credentials?.body)[0];

  const licenses = documents.filter((doc) => doc.kind === "license");
  const certificates = documents.filter((doc) => doc.kind === "iso_certificate");
  const listedClients = clients.filter((client) => client.inClientList);

  return (
    <section
      className="bg-brand-navy px-(--oc-page-margin) py-(--oc-section-y) text-white"
      data-section="credentials"
      id="credentials"
    >
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {heading ? <h2 className="font-display text-3xl font-bold md:text-4xl">{heading}</h2> : null}
          {intro ? <p className="mt-4 text-base leading-relaxed text-muted-on-dark">{intro}</p> : null}
        </div>

        <ul className="columns-2 gap-8 text-base leading-snug md:columns-3 xl:columns-4 lg:col-span-8">
          <li className="mb-2 font-bold text-brand-green-light">{t("licensesGroup")}</li>
          {licenses.map((license) => (
            <li className="break-inside-avoid" key={license.id}>
              {license.title}
            </li>
          ))}

          <li aria-hidden className="mb-4 h-5 break-inside-avoid" />

          <li className="mb-2 font-bold text-brand-green-light">{t("partnersGroup")}</li>
          {partners.map((partner) => (
            <li className="break-inside-avoid" key={partner.id}>
              {partner.name}
              {partner.field ? `: ${partner.field}` : ""}
            </li>
          ))}

          <li className="mb-2 font-bold text-brand-green-light">{t("clientsGroup")}</li>
          {listedClients.map((client) => (
            <li className="break-inside-avoid" key={`${client.sortOrder}-${client.slug ?? "client"}`}>
              {client.name ?? t("unnamedClient")}
            </li>
          ))}
        </ul>
      </div>

      {certificates.length > 0 ? (
        <div className="mt-(--oc-section-y) grid gap-8 lg:grid-cols-12">
          <h3 className="font-display text-3xl font-bold text-brand-green-light lg:col-span-4">{t("isoHeading")}</h3>
          <ul className="grid gap-x-12 sm:grid-cols-2 lg:col-span-8">
            {certificates.map((certificate) => (
              <li className="flex items-baseline justify-between gap-4 border-b border-white/15 py-4" key={certificate.id}>
                <span className="num-isolate text-2xl font-bold" dir="ltr">
                  {certificate.standardCode ?? certificate.title}
                </span>
                <span className="text-end text-base text-muted-on-dark">
                  {certificate.title}
                  {certificate.isExpired ? (
                    <Badge className="ms-2" tone="neutral">
                      {aboutT("expiredBadge")}
                    </Badge>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
