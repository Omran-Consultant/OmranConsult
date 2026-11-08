import { getTranslations } from "next-intl/server";

import { CertificateCard } from "@/core/ui/certificate-card";
import { SectionHeader } from "@/core/ui/section-header";
import { StatusBadge } from "@/core/ui/status-badge";
import { WordmarkStrip } from "@/core/ui/wordmark-strip";
import type { HomeView } from "@/features/home/services/home-view";

/**
 * Figma Home "Trust": the eight ISO certificates from the profile (D6: the design's ISO 55001 is
 * not shown) with an expired badge, then the partner logos (Q11: partners only).
 */
export async function HomeTrust({ view }: { readonly view: HomeView }) {
  const t = await getTranslations("Home");
  const { trust: copy } = view.copy;

  return (
    <section aria-labelledby="home-trust-title" className="bg-canvas py-16 lg:py-35" data-section="trust">
      <div className="container-page flex flex-col gap-14">
        {copy.title ? <SectionHeader overline={copy.overline} subtitle={copy.subtitle} title={copy.title} titleId="home-trust-title" /> : null}

        {view.certificates.length > 0 ? (
          <ul aria-label={t("certificates")} className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

        <WordmarkStrip
          items={view.partners.map((partner) => ({ key: partner.slug, wordmark: partner.wordmark, title: partner.name }))}
          label={copy.partners_label}
        />
      </div>
    </section>
  );
}
