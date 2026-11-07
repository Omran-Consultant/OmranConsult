import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { HomeServicesBand } from "@/features/home/components/home-services-band";
import { resolveServicesBandItems } from "@/features/services/lib/resolve-services-band-items";
import type { AppLocale } from "@/i18n/routing";

type ServiceCategory = {
  readonly slug: string;
  readonly kind: string;
  readonly title?: string;
  readonly services: readonly { readonly slug: string; readonly title?: string }[];
};

type HomeServicesSectionProps = {
  readonly locale: AppLocale;
  readonly heading?: string;
  readonly categories: readonly ServiceCategory[];
};

export async function HomeServicesSection({ categories, heading, locale }: HomeServicesSectionProps) {
  const t = await getTranslations("HomePage");
  const axisCategories = categories.filter((category) => category.kind === "axis");
  const bandItems = resolveServicesBandItems(categories);
  const listColumns = [
    ...axisCategories.slice(0, 3),
    categories.find((category) => category.kind === "asset_management"),
  ].filter((category): category is ServiceCategory => Boolean(category));

  return (
    <section className="bg-brand-green-light text-brand-navy-deep" data-section="services" id="services">
      <div className="px-(--oc-page-margin) pt-(--oc-section-y)">
        {heading ? (
          <h2 className="font-display text-center text-(--text-oc-h2) leading-tight font-bold md:col-span-8 md:col-start-3">
            {heading}
          </h2>
        ) : null}
      </div>

      <HomeServicesBand items={bandItems} locale={locale} />

      <div className="grid gap-10 px-(--oc-page-margin) pt-14 sm:grid-cols-2 lg:grid-cols-4">
        {listColumns.map((category) => (
          <div key={category.slug}>
            {category.title ? <h3 className="font-display mb-4 text-xl font-bold">{category.title}</h3> : null}
            <ul className="divide-y divide-brand-navy-deep/15">
              {category.services.slice(0, 5).map((service) => (
                <li className="py-1.5 text-base leading-snug" key={service.slug}>
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="px-(--oc-page-margin) py-10">
        <LinkButton href="/services" variant="outline">
          {t("servicesCta")}
        </LinkButton>
      </div>
    </section>
  );
}
