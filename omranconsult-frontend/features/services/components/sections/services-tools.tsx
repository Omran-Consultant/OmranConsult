import { ToolCard } from "@/core/ui/service-card";
import { SectionHeader } from "@/core/ui/section-header";
import type { ServicesView } from "@/features/services/services/get-services-page-data";
import { TOOL_ICONS } from "@/features/services/services/services-view";

/** Figma Services "Tools": all ten profile tools in the 3-column icon card style (the design shows 6). */
export function ServicesTools({ view }: { readonly view: ServicesView }) {
  const { items, section_title: title } = view.blocks.tools;
  const tools = items.filter((tool) => tool.title);
  if (!title || tools.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="services-tools-title" className="bg-surface py-12 lg:py-27.5" data-section="tools" id="tools">
      <div className="container-page flex flex-col gap-6 lg:gap-12">
        <SectionHeader overline={view.copy.tools.overline} title={title} titleId="services-tools-title" />
        <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {tools.map((tool, index) => (
            <li data-reveal="" key={tool.title} style={{ "--reveal-index": index % 3 } as React.CSSProperties}>
              <ToolCard description={tool.body} icon={TOOL_ICONS[index] ?? "cog"} title={tool.title ?? ""} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
