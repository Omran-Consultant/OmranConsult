import { HomeServicesBand } from "@/features/home/components/home-services-band";
import { resolveServicesBandItems } from "@/features/services/lib/resolve-services-band-items";
import type { AppLocale } from "@/i18n/routing";

type ServiceCategory = {
  readonly slug: string;
  readonly kind: string;
  readonly title?: string;
  readonly services: readonly { readonly slug: string; readonly title?: string }[];
};

type ServicesAxesSectionProps = {
  readonly locale: AppLocale;
  readonly heading?: string;
  readonly categories: readonly ServiceCategory[];
};

export function ServicesAxesSection({ categories, heading, locale }: ServicesAxesSectionProps) {
  const axisCategories = categories.filter((category) => category.kind === "axis");
  const bandItems = resolveServicesBandItems(categories);

  return (
    <section className="bg-accent-strong text-primary" data-section="axes">
      {heading ? (
        <div className="px-page pt-(--section-y)">
          <h2 className="font-display text-center text-h1 leading-tight font-bold">{heading}</h2>
        </div>
      ) : null}

      <HomeServicesBand items={bandItems} locale={locale} />

      <div className="grid gap-10 px-page pt-14 sm:grid-cols-2 lg:grid-cols-3">
        {axisCategories.map((category) => (
          <div key={category.slug}>
            {category.title ? <h3 className="font-display mb-4 text-xl font-bold">{category.title}</h3> : null}
            <ul className="divide-y divide-line">
              {category.services.map((service) => (
                <li className="py-1.5 text-base leading-snug" key={service.slug}>
                  {service.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
