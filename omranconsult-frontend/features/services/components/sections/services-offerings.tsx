import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";

/** ✚ Core offerings and the flexible model (D5): two glass panels with the profile items. */
export function ServicesOfferings({ view }: { readonly view: ServicesView }) {
  const panels = [view.blocks.core_offerings, view.blocks.flexible_model].filter((panel) => panel.section_title && panel.items.length > 0);
  if (panels.length === 0) {
    return null;
  }

  return (
    <section aria-label={panels.map((panel) => panel.section_title).join(" · ")} className="bg-surface py-section-y" data-section="offerings" id="offerings">
      <div className="container-page grid gap-4 lg:grid-cols-2 lg:gap-6">
        {panels.map((panel, index) => (
          <div className="glass flex flex-col gap-6 rounded-xl border border-line p-6 lg:p-10" data-reveal="" key={panel.section_title} style={{ "--reveal-index": index } as React.CSSProperties}>
            <SectionHeader as="h2" overline={index === 0 ? view.copy.offerings.overline : undefined} title={panel.section_title ?? ""} />
            <ul className="flex flex-wrap gap-2.5">
              {panel.items.map((item) =>
                item.title ? (
                  <li className="rounded-full border border-line-strong px-4 py-2 text-label-m text-secondary" key={item.title}>
                    {item.title}
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
