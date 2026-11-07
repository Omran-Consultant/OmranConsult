import { asObject, asString, asStringList } from "@/features/home/lib/block-helpers";

type AboutEsgSectionProps = {
  readonly esgBlock: unknown;
};

type PillarRecord = {
  readonly title?: string;
  readonly items: readonly string[];
};

function mapPillars(block: Record<string, unknown> | undefined): readonly PillarRecord[] {
  const raw = block?.pillars;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((pillar) => {
    const record = typeof pillar === "object" && pillar !== null ? (pillar as Record<string, unknown>) : {};
    return {
      title: asString(record.title),
      items: asStringList(record.items),
    };
  });
}

export function AboutEsgSection({ esgBlock }: AboutEsgSectionProps) {
  const block = asObject(esgBlock);
  const heading = asString(block?.section_title);
  const body = asStringList(block?.body);
  const pillars = mapPillars(block);

  if (!heading && body.length === 0 && pillars.length === 0) {
    return null;
  }

  return (
    <section className="px-(--oc-page-margin) py-(--oc-section-y)" data-section="esg" id="esg">
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {heading ? <h2 className="font-display text-(--text-oc-h2) font-bold text-heading">{heading}</h2> : null}
          <div className="mt-7 flex flex-col gap-4.5 text-lg leading-[1.85] text-muted">
            {body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-5">
          {pillars.map((pillar, index) => (
            <article key={`${pillar.title ?? "pillar"}-${index}`}>
              {pillar.title ? <h3 className="font-display text-2xl font-extrabold text-heading">{pillar.title}</h3> : null}
              {pillar.items.length > 0 ? (
                <p className="mt-2 text-base leading-relaxed text-muted">{pillar.items.join(" · ")}</p>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
