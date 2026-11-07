type ServicesAssetManagementSectionProps = {
  readonly heading?: string;
  readonly description?: string;
  readonly services: readonly { readonly slug: string; readonly title?: string }[];
};

export function ServicesAssetManagementSection({
  description,
  heading,
  services,
}: ServicesAssetManagementSectionProps) {
  return (
    <section
      className="grid gap-10 px-page pt-(--section-y) lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
      data-section="asset-management"
    >
      <div>
        {heading ? (
          <h2 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-tight font-bold">{heading}</h2>
        ) : null}
        {description ? (
          <p className="mt-4 text-body-l leading-relaxed text-secondary">{description}</p>
        ) : null}
      </div>
      <ol className="list-none [counter-reset:asset-item] md:columns-2 md:gap-10">
        {services.map((service) => (
          <li
            className="flex gap-3.5 py-3.5 [counter-increment:asset-item] before:min-w-5.5 before:font-sans before:text-[0.9375rem] before:leading-normal before:font-bold before:text-accent before:content-[counter(asset-item)]"
            key={service.slug}
          >
            <span className="font-display text-lg leading-snug font-bold">{service.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
