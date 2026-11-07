import { asObject, asString } from "@/features/home/lib/block-helpers";

type AboutToolsSectionProps = {
  readonly toolsBlock: unknown;
};

type ToolItem = {
  readonly title?: string;
  readonly body?: string;
};

function mapToolItems(block: Record<string, unknown> | undefined): readonly ToolItem[] {
  const raw = block?.items;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((item) => {
    const record = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return {
      title: asString(record.title),
      body: asString(record.body),
    };
  });
}

export function AboutToolsSection({ toolsBlock }: AboutToolsSectionProps) {
  const block = asObject(toolsBlock);
  const heading = asString(block?.section_title);
  const intro = asString(block?.intro);
  const items = mapToolItems(block);

  if (!heading && items.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface px-(--oc-page-margin) py-(--oc-section-y)" data-section="tools" id="tools">
      <div className="grid gap-12 md:grid-cols-2 md:items-end">
        {heading ? <h2 className="font-display text-(--text-oc-h2) font-bold text-heading">{heading}</h2> : null}
        {intro ? <p className="text-(--text-oc-lead) leading-relaxed text-muted">{intro}</p> : <span aria-hidden />}
      </div>

      <div className="mt-16 columns-1 gap-16 md:columns-2">
        {items.map((item, index) => (
          <article
            className="mb-0 grid break-inside-avoid gap-2 border-t border-border-strong py-5.5 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6"
            key={`${item.title ?? "tool"}-${index}`}
          >
            {item.title ? (
              <h3 className="font-display text-2xl font-extrabold text-heading transition-colors">{item.title}</h3>
            ) : null}
            {item.body ? <p className="text-base leading-relaxed text-muted">{item.body}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
