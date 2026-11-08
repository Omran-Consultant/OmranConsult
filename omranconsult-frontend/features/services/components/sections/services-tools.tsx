import { Icon } from "@/core/ui/icon";
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
        <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
          {tools.map((tool, index) => (
            <li
              className="flex items-start gap-4.5 rounded-lg border border-line bg-canvas p-6"
              data-reveal=""
              key={tool.title}
              style={{ "--reveal-index": index % 3 } as React.CSSProperties}
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-accent-strong/16 text-accent">
                <Icon className="size-6" name={TOOL_ICONS[index] ?? "cog"} />
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-h4 text-primary">{tool.title}</h3>
                {tool.body ? <p className="text-body-s text-secondary">{tool.body}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
