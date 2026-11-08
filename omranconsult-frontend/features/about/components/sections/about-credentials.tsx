import { getTranslations } from "next-intl/server";

import { CertificateCard } from "@/core/ui/certificate-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "Trust" (#credentials): ISO cards and the five licences. Partner logos are the next section. */
export async function AboutCredentials({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("AboutPage");
  const trust = view.homeCopy.trust;
  const { licenses_title: licensesTitle } = view.blocks.credentials;

  return (
    <section aria-labelledby="about-trust-title" className="scroll-mt-24 bg-canvas py-16 lg:py-35" data-section="trust" id="credentials">
      <div className="container-page flex flex-col gap-14">
        {trust.title ? <SectionHeader overline={trust.overline} subtitle={trust.subtitle} title={trust.title} titleId="about-trust-title" /> : null}
        {view.certificates.length > 0 ? (
          <ul aria-label={t("certificatesLabel")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {view.certificates.map((certificate, index) => (
              <li data-reveal="" key={certificate.id} style={{ "--reveal-index": index % 4 } as React.CSSProperties}>
                <CertificateCard code={certificate.code} image={certificate.image} label={certificate.label} />
              </li>
            ))}
          </ul>
        ) : null}
        {view.licenses.length > 0 ? (
          <div className="flex flex-col gap-6">
            {licensesTitle ? <h3 className="font-display text-h3 text-primary">{licensesTitle}</h3> : null}
            <ul aria-label={licensesTitle ?? t("licensesLabel")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {view.licenses.map((license, index) => (
                <li data-reveal="" key={license.id} style={{ "--reveal-index": index % 5 } as React.CSSProperties}>
                  <CertificateCard image={license.image} label={license.label} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
