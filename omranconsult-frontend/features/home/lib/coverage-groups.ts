/**
 * Presentation-only grouping of the API regions into the design's macro regions (Coverage
 * section, PHASE4C plan §5). Names come from messages (Home.coverage.*); regions from /api/regions.
 */
export const COVERAGE_GROUPS = [
  { key: "central", regions: ["riyadh", "al-qassim"] },
  { key: "western", regions: ["makkah", "madinah"] },
  { key: "southern", regions: ["jazan", "asir", "najran", "al-baha"] },
  { key: "eastern", regions: ["eastern-province"] },
  { key: "northern", regions: ["northern-region", "tabuk"] },
] as const;

export type CoverageGroupKey = (typeof COVERAGE_GROUPS)[number]["key"];

type RegionLike = { readonly slug: string; readonly name?: string };

/** Groups with the names of their API regions; empty groups are dropped. */
export function groupRegions(regions: readonly RegionLike[]) {
  const bySlug = new Map(regions.map((region) => [region.slug, region.name]));
  return COVERAGE_GROUPS.map((group) => ({
    key: group.key,
    regions: group.regions.map((slug) => bySlug.get(slug)).filter((name): name is string => Boolean(name)),
  })).filter((group) => group.regions.length > 0);
}
