import { getTranslations } from "next-intl/server";

import { Badge } from "@/core/ui/badge";
import { asObject, asString, asStringList } from "@/features/home/lib/block-helpers";

type DocumentRow = {
  readonly id: number;
  readonly kind: string;
  readonly title?: string;
  readonly standardCode?: string;
  readonly validFrom?: string;
  readonly validUntil?: string;
  readonly isExpired: boolean;
};

type AboutCredentialsSectionProps = {
  readonly blocks: unknown;
  readonly documents: readonly DocumentRow[];
  readonly locale: import("@/i18n/routing").AppLocale;
};

export async function AboutCredentialsSection({ blocks, documents, locale }: AboutCredentialsSectionProps) {
  const t = await getTranslations({ locale, namespace: "AboutPage" });
  const homeT = await getTranslations({ locale, namespace: "HomePage" });
  const credentials = asObject(
    typeof blocks === "object" && blocks !== null ? (blocks as Record<string, unknown>).credentials : undefined,
  );
  const sectionTitles = asObject(
    typeof blocks === "object" && blocks !== null ? (blocks as Record<string, unknown>).section_titles : undefined,
  );
  const heading = asString(credentials?.heading) ?? asString(sectionTitles?.credentials);
  const intro =
    asString(credentials?.licenses_intro) ??
    asString(credentials?.intro) ??
    asStringList(credentials?.body)[0];

  const licenses = documents.filter((doc) => doc.kind === "license");
  const certificates = documents.filter((doc) => doc.kind === "iso_certificate");

  if (!heading && licenses.length === 0 && certificates.length === 0) {
    return null;
  }

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

        <ul className="columns-2 gap-8 text-base leading-snug md:columns-3 lg:col-span-8">
          {licenses.length > 0 ? (
            <li className="mb-2 font-bold text-brand-green-light">
              {asString(credentials?.licenses_title) ?? homeT("licensesGroup")}
            </li>
          ) : null}
          {licenses.map((license) => (
            <li className="break-inside-avoid" key={license.id}>
              <span>{license.title}</span>
              {license.validUntil ? (
                <span className="num-isolate mt-1 block text-sm text-muted-on-dark" dir="ltr">
                  {license.validUntil}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {certificates.length > 0 ? (
        <div className="mt-(--oc-section-y) grid gap-8 lg:grid-cols-12">
          <h3 className="font-display text-3xl font-bold text-brand-green-light lg:col-span-4">
            {asString(credentials?.certificates_title) ?? homeT("isoHeading")}
          </h3>
          <ul className="grid gap-x-12 sm:grid-cols-2 lg:col-span-8">
            {certificates.map((certificate) => (
              <li
                className="flex flex-col gap-2 border-b border-white/15 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                key={certificate.id}
              >
                <span className="num-isolate text-2xl font-bold" dir="ltr">
                  {certificate.standardCode ?? certificate.title}
                </span>
                <div className="text-base text-muted-on-dark sm:text-end">
                  <span>{certificate.title}</span>
                  {certificate.validFrom || certificate.validUntil ? (
                    <span className="num-isolate mt-1 block text-sm" dir="ltr">
                      {[certificate.validFrom, certificate.validUntil].filter(Boolean).join(" – ")}
                    </span>
                  ) : null}
                  {certificate.isExpired ? (
                    <Badge className="ms-0 mt-2 sm:ms-2" tone="neutral">
                      {t("expiredBadge")}
                    </Badge>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
