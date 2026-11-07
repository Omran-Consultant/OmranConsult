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
      className={`rounded-(--oc-radius-brand) bg-surface px-4 py-3 text-center ${highlight ? "ring-2 ring-brand-green-strong" : ""}`}
    >
      {node.title ? <p className="font-display text-base font-bold text-heading">{node.title}</p> : null}
      {node.person?.name ? <p className="mt-1 text-sm text-muted">{node.person.name}</p> : null}
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
    <section className="bg-surface px-(--oc-page-margin) py-24" data-section="org-chart" id="org-chart">
      {heading ? (
        <h2 className="font-display text-(--text-oc-h2) font-bold text-heading">{heading}</h2>
      ) : null}

      <div className="mt-14 flex flex-col items-center gap-5">
        {layout.top ? (
          <div className="w-full max-w-xs">
            <OrgPersonCard highlight node={layout.top} />
          </div>
        ) : null}

        {layout.top && layout.boardRow.length > 0 ? (
          <span aria-hidden className="h-6 w-px bg-border-strong" />
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
                    <h3 className="py-3 font-display text-lg font-bold text-brand-green-strong">{groupHeading}</h3>
                  ) : null}
                  <ul className="space-y-2">
                    {column.nodes.map((node) => (
                      <li className="rounded-(--oc-radius-brand) bg-page px-4 py-3" key={node.id}>
                        {node.title ? <p className="font-semibold text-heading">{node.title}</p> : null}
                        {node.person?.name ? <p className="text-sm text-muted">{node.person.name}</p> : null}
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
