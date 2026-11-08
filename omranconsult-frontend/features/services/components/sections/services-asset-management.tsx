import Image from "next/image";

import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";
import { splitColumns } from "@/features/services/services/services-view";

const ARCH = "rounded-t-[230px] rounded-b-lg";

/** Figma Services "Asset Management": arch photo, header, the ten numbered services in two columns. */
export function ServicesAssetManagement({ view }: { readonly view: ServicesView }) {
  const category = view.assetManagement;
  const copy = view.copy.asset_management;
  const services = (category?.services ?? []).filter((service) => service.title);
  if (!category || services.length === 0) {
    return null;
  }
  const columns = splitColumns(services.map((service, index) => ({ ...service, number: String(index + 1).padStart(2, "0") })));

  return (
    <section aria-labelledby="services-asset-title" className="bg-surface py-12 lg:py-32.5" data-section="asset-management" id="asset-management">
      <div className="container-page grid gap-6 lg:grid-cols-[740fr_460fr] lg:items-center lg:gap-20">
        <div className="flex flex-col gap-6 lg:gap-9">
          <SectionHeader
            className="max-w-none max-md:[&>p:last-of-type]:hidden"
            overline={copy.overline}
            overlineShort={copy.overline_short}
            subtitle={copy.subtitle}
            title={copy.title ?? category.title ?? ""}
            titleId="services-asset-title"
          />
          <div className="grid md:grid-cols-2 md:gap-10">
            {columns.map((column, columnIndex) => (
              <ol className="flex flex-col" key={columnIndex}>
                {column.map((service) => (
                  <li className="flex items-center gap-4 border-b border-line py-3.25 md:py-4" key={service.slug}>
                    <span className="text-body-m text-primary">{service.title}</span>
                    <span className="num-isolate shrink-0 font-latin text-overline text-accent">{service.number}</span>
                  </li>
                ))}
              </ol>
            ))}
          </div>
        </div>
        <div className={`relative hidden aspect-[460/600] overflow-hidden bg-highlight lg:block ${ARCH}`} data-reveal="">
          <Image alt={view.images.assetManagement.alt} className="object-cover" fill sizes="460px" src={view.images.assetManagement.src} />
        </div>
      </div>
    </section>
  );
}
