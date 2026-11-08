import { getTranslations } from "next-intl/server";

import { CertificateCard } from "@/core/ui/certificate-card";
import { SectionHeader } from "@/core/ui/section-header";
import { StatusBadge } from "@/core/ui/status-badge";
import { WordmarkStrip } from "@/core/ui/wordmark-strip";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Trust" (#credentials): ISO cards, ✚ the five licences in the same card style, wordmarks. */
export async function AboutCredentials({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("AboutPage");
  const trust = view.homeCopy.trust;
  const { licenses_title: licensesTitle } = view.blocks.credentials;

  return (
    <section aria-labelledby="about-trust-title" className="scroll-mt-24 bg-canvas py-16 lg:py-35" data-section="trust" id="credentials">
      <div className="container-page flex flex-col gap-14">
        {trust.title ? <SectionHeader overline={trust.overline} subtitle={trust.subtitle} title={trust.title} titleId="about-trust-title" /> : null}
        {view.certificates.length > 0 ? (
          <ul aria-label={t("certificatesLabel")} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {view.certificates.map((certificate, index) => (
              <li data-reveal="" key={certificate.id} style={{ "--reveal-index": index % 4 } as React.CSSProperties}>
                <CertificateCard
                  badge={certificate.expired ? <StatusBadge tone="neutral">{t("expired")}</StatusBadge> : null}
                  code={certificate.code}
                  label={certificate.label}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {view.licenses.length > 0 ? (
          <div className="flex flex-col gap-6">
            {licensesTitle ? <h3 className="font-display text-h3 text-primary">{licensesTitle}</h3> : null}
            <ul aria-label={licensesTitle ?? t("licensesLabel")} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {view.licenses.map((license, index) => (
                <li data-reveal="" key={license.id} style={{ "--reveal-index": index % 5 } as React.CSSProperties}>
                  <CertificateCard label={license.label} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <WordmarkStrip items={view.wordmarks} label={trust.partners_label} />
      </div>
    </section>
  );
}
