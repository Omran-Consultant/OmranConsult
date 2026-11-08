import { getTranslations } from "next-intl/server";

import { CertificateCard } from "@/core/ui/certificate-card";
import { PartnerGrid } from "@/core/ui/partner-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { HomeView } from "@/features/home/services/home-view";

/**
 * Figma Home "Trust": the eight ISO certificates from the profile (D6: the design's ISO 55001 is
 * not shown), then the same partner cards as About (A34). The expired badge stays hidden (A31).
 */
export async function HomeTrust({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { trust: copy } = view.copy;

  return (
    <section aria-labelledby="home-trust-title" className="bg-canvas py-16 lg:py-35" data-section="trust">
      <div className="container-page flex flex-col gap-14">
        {copy.title ? <SectionHeader overline={copy.overline} subtitle={copy.subtitle} title={copy.title} titleId="home-trust-title" /> : null}

        {view.certificates.length > 0 ? (
          <ul aria-label={t("certificates")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {view.certificates.map((certificate, index) => (
              <li data-reveal="" key={certificate.id} style={{ "--reveal-index": index % 4 } as React.CSSProperties}>
                <CertificateCard code={certificate.code} image={certificate.image} label={certificate.label} />
              </li>
            ))}
          </ul>
        ) : null}

        {view.partners.length > 0 ? (
          <div className="flex flex-col gap-6">
            {copy.partners_label ? (
              <h3 className="text-label-m text-secondary" id="home-partners-label">
                {copy.partners_label}
              </h3>
            ) : null}
            <PartnerGrid labelId={copy.partners_label ? "home-partners-label" : undefined} partners={view.partners} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
