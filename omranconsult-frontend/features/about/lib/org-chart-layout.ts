export type OrgChartNode = {
  readonly id: number;
  readonly parentId: number | null;
  readonly group: string;
  readonly title?: string;
  readonly person?: {
    readonly id: number;
    readonly slug: string;
    readonly name?: string;
  };
};

const COLUMN_GROUP_ORDER = [
  "executive_management",
  "committees",
  "projects",
  "planning_control",
] as const;

export type OrgChartLayout = {
  readonly top?: OrgChartNode;
  readonly boardRow: readonly OrgChartNode[];
  readonly committeesRow: readonly OrgChartNode[];
  readonly columns: ReadonlyArray<{
    readonly group: string;
    readonly nodes: readonly OrgChartNode[];
  }>;
};

export function layoutOrgChart(nodes: readonly OrgChartNode[]): OrgChartLayout {
  const byGroup = new Map<string, OrgChartNode[]>();
  for (const node of nodes) {
    const list = byGroup.get(node.group) ?? [];
    list.push(node);
    byGroup.set(node.group, list);
  }

  const board = byGroup.get("board") ?? [];
  const top = board[0];
  const boardRow = board.slice(1);

  return {
    top,
    boardRow,
    committeesRow: byGroup.get("board_committees") ?? [],
    columns: COLUMN_GROUP_ORDER.map((group) => ({
      group,
      nodes: byGroup.get(group) ?? [],
    })).filter((column) => column.nodes.length > 0),
  };
}
