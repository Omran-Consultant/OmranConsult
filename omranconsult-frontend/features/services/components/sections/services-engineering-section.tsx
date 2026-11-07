type ServicesEngineeringSectionProps = {
  readonly heading?: string;
  readonly body?: string;
  readonly disciplines: readonly { readonly slug: string; readonly title?: string }[];
};

export function ServicesEngineeringSection({ body, disciplines, heading }: ServicesEngineeringSectionProps) {
  return (
    <section className="bg-canvas px-page py-section-y" data-section="engineering">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-12">
        {heading ? (
          <h2 className="font-display text-h1 leading-tight font-bold text-primary">{heading}</h2>
        ) : null}
        {body ? <p className="text-body-l leading-relaxed text-secondary lg:max-w-prose">{body}</p> : null}
      </div>

      <ul className="mt-16 list-none md:columns-2 xl:columns-3 xl:gap-16">
        {disciplines.map((discipline) => (
          <li
            className="break-inside-avoid py-2.5 font-display text-[clamp(1.375rem,2vw,1.875rem)] leading-snug font-bold text-primary motion-safe:transition-colors motion-safe:duration-200 motion-safe:hover:text-accent"
            key={discipline.slug}
          >
            {discipline.title}
          </li>
        ))}
      </ul>
    </section>
  );
}
