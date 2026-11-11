import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** ✚ «عملاؤنا» (Q11): all client logos on white tiles, after Partners. */
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
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 lg:gap-4">
          {view.clients.map((client) => (
            <li className="flex h-24 items-center justify-center rounded-md border border-line bg-white p-4 lg:h-28" key={client.key}>
              {client.logo ? (
                <Image
                  alt={client.name ?? t("brand.clientLogoAlt")}
                  className="max-h-full w-auto object-contain"
                  height={client.logo.height}
                  sizes="160px"
                  src={client.logo.src}
                  width={client.logo.width}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
