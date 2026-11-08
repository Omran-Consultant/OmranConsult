import { classNames } from "@/core/ui/class-names";
import { SectionHeader } from "@/core/ui/section-header";
import { layoutOrgChart, type OrgChartNode } from "@/features/about/lib/org-chart-layout";
import type { AboutView } from "@/features/about/services/get-about-page-data";

function Node({ node, highlight = false }: { readonly node: OrgChartNode; readonly highlight?: boolean }) {
  return (
    <div className={classNames("rounded-lg border px-5 py-4 text-center", highlight ? "border-line-accent bg-accent-strong/12" : "glass border-line")}>
      {node.title ? <p className="font-display text-label-m text-primary">{node.title}</p> : null}
      {node.person?.name ? <p className="mt-1 text-body-s text-secondary">{node.person.name}</p> : null}
    </div>
  );
}

/** ✚ Organizational chart (D5): top node, rows, and group columns in glass cards; nested lists on mobile. */
export function AboutOrgChart({ view }: { readonly view: AboutView }) {
  const layout = layoutOrgChart(view.orgChart);
  const { org_chart: title, org_groups: groups } = view.blocks.section_titles;
  if (view.orgChart.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="about-org-title" className="bg-canvas py-section-y" data-section="org-chart" id="org-chart">
      <div className="container-page flex flex-col gap-section-gap">
        {title ? <SectionHeader overline={view.copy.org_chart.overline} title={title} titleId="about-org-title" /> : null}
        <div className="flex flex-col items-stretch gap-4 md:items-center">
          {layout.top ? (
            <div className="md:w-80">
              <Node highlight node={layout.top} />
            </div>
          ) : null}
          {layout.boardRow.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-3 md:self-stretch lg:grid-cols-4">
              {layout.boardRow.map((node) => (
                <li key={node.id}>
                  <Node node={node} />
                </li>
              ))}
            </ul>
          ) : null}
          {layout.committeesRow.length > 0 ? (
            <ul className="grid gap-3 md:grid-cols-2 md:self-stretch lg:grid-cols-3">
              {layout.committeesRow.map((node) => (
                <li key={node.id}>
                  <Node node={node} />
                </li>
              ))}
            </ul>
          ) : null}
          {layout.columns.length > 0 ? (
            <div className="mt-4 grid gap-6 md:grid-cols-2 md:self-stretch xl:grid-cols-4">
              {layout.columns.map((column) => (
                <div className="flex flex-col gap-3" key={column.group}>
                  {groups[column.group] ? <h3 className="border-b border-line pb-3 font-display text-h4 text-accent">{groups[column.group]}</h3> : null}
                  <ul className="flex flex-col gap-2">
                    {column.nodes.map((node) => (
                      <li key={node.id}>
                        <Node node={node} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
