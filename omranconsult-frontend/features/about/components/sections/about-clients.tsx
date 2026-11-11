import { getTranslations } from "next-intl/server";

import { LogoTileGrid } from "@/core/ui/logo-tile-grid";
import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** ✚ «عملاؤنا» (Q11): all client logos on the profile-style tiles, after Partners. */
export async function AboutClients({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("Layout");
  const title = view.slides.clients?.headline;
  if (view.clients.length === 0 || !title) {
    return null;
  }

  return (
    <section aria-labelledby="about-clients-title" className="bg-canvas py-section-y" data-section="clients" id="clients">
      <div className="container-page flex flex-col gap-section-gap">
        <SectionHeader overline={view.copy.clients.overline} subtitle={view.slides.clients?.subline} title={title} titleId="about-clients-title" />
        <LogoTileGrid fallbackAlt={t("brand.clientLogoAlt")} tiles={view.clients} />
      </div>
    </section>
  );
}
