import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "@/core/ui/section-header";
import { StatusBadge } from "@/core/ui/status-badge";
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
              <li
                className="glass flex flex-col items-center gap-2 rounded-lg border border-line px-4 py-7 text-center"
                data-reveal=""
                key={certificate.id}
                style={{ "--reveal-index": index % 4 } as React.CSSProperties}
              >
                <span aria-hidden="true" className="mb-1 size-11 rounded-full border-[1.5px] border-accent" />
                <span className="font-latin text-base font-bold text-primary" dir="ltr">
                  {certificate.code}
                </span>
                {certificate.label ? <span className="text-caption text-muted">{certificate.label}</span> : null}
                {certificate.expired ? <StatusBadge tone="danger">{t("expired")}</StatusBadge> : null}
              </li>
            ))}
          </ul>
        ) : null}

        {view.partners.length > 0 ? (
          <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:gap-14">
            {copy.partners_label ? <h3 className="shrink-0 text-label-m text-secondary">{copy.partners_label}</h3> : null}
            <ul className="flex flex-1 flex-wrap items-center justify-between gap-x-10 gap-y-6">
              {view.partners.map((partner) => (
                <li className="flex h-16 items-center" key={partner.slug}>
                  {partner.logo ? (
                    <Image
                      alt={partner.name}
                      className="h-full w-auto object-contain opacity-70 grayscale mix-blend-multiply on-dark:mix-blend-screen on-dark:invert"
                      height={partner.logo.height}
                      sizes="160px"
                      src={partner.logo.src}
                      width={partner.logo.width}
                    />
                  ) : (
                    <span className="font-latin text-[1.375rem] font-bold tracking-wide text-muted uppercase" dir="ltr">
                      {partner.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
