import { layoutOrgChart } from "@/features/about/lib/org-chart-layout";
import { asObject, asString } from "@/features/home/lib/block-helpers";
import { resolveOrgGroupHeading } from "@/features/public-content/services/org-group-headings";

type OrgChartNode = import("@/features/about/lib/org-chart-layout").OrgChartNode;

type AboutOrgChartSectionProps = {
  readonly orgChart: readonly OrgChartNode[];
  readonly blocks: unknown;
};

function OrgPersonCard({ node, highlight }: { readonly node: OrgChartNode; readonly highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg bg-surface px-4 py-3 text-center ${highlight ? "ring-2 ring-accent" : ""}`}
    >
      {node.title ? <p className="font-display text-base font-bold text-primary">{node.title}</p> : null}
      {node.person?.name ? <p className="mt-1 text-sm text-secondary">{node.person.name}</p> : null}
    </div>
  );
}

export function AboutOrgChartSection({ blocks, orgChart }: AboutOrgChartSectionProps) {
  const sectionTitles = asObject(
    typeof blocks === "object" && blocks !== null ? (blocks as Record<string, unknown>).section_titles : undefined,
  );
  const orgGroupTitles = asObject(sectionTitles?.org_groups);
  const heading = asString(sectionTitles?.org_chart);
  const layout = layoutOrgChart(orgChart);

  if (!heading && orgChart.length === 0) {
    return null;
  }

  return (
    <section className="bg-surface px-page py-24" data-section="org-chart" id="org-chart">
      {heading ? (
        <h2 className="font-display text-h1 font-bold text-primary">{heading}</h2>
      ) : null}

      <div className="mt-14 flex flex-col items-center gap-5">
        {layout.top ? (
          <div className="w-full max-w-xs">
            <OrgPersonCard highlight node={layout.top} />
          </div>
        ) : null}

        {layout.top && layout.boardRow.length > 0 ? (
          <span aria-hidden className="h-6 w-px bg-line-strong" />
        ) : null}

        {layout.boardRow.length > 0 ? (
          <div className="flex w-full flex-wrap justify-center gap-3">
            {layout.boardRow.map((node, index) => (
              <div className="min-w-[min(100%,220px)] max-w-xs flex-1" key={node.id}>
                <OrgPersonCard highlight={index === 0} node={node} />
              </div>
            ))}
          </div>
        ) : null}

        {layout.committeesRow.length > 0 ? (
          <div className="flex w-full flex-wrap justify-center gap-3">
            {layout.committeesRow.map((node) => (
              <div className="min-w-[min(100%,260px)] max-w-sm flex-1" key={node.id}>
                <OrgPersonCard node={node} />
              </div>
            ))}
          </div>
        ) : null}

        {layout.columns.length > 0 ? (
          <div className="mt-4 grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {layout.columns.map((column) => {
              const groupHeading = resolveOrgGroupHeading(orgGroupTitles, column.group);
              return (
                <div key={column.group}>
                  {groupHeading ? (
                    <h3 className="py-3 font-display text-lg font-bold text-accent">{groupHeading}</h3>
                  ) : null}
                  <ul className="space-y-2">
                    {column.nodes.map((node) => (
                      <li className="rounded-lg bg-canvas px-4 py-3" key={node.id}>
                        {node.title ? <p className="font-semibold text-primary">{node.title}</p> : null}
                        {node.person?.name ? <p className="text-sm text-secondary">{node.person.name}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
