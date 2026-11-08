/**
 * Presentation groups for the About experts filter. Each slug follows the profile title
 * (studies and design, civil engineering, hydrology, architectural design, quality, data analysis).
 * An expert the map does not know stays in «All» only.
 */
export const EXPERT_GROUPS = ["design", "quality", "data"] as const;

export type ExpertGroup = (typeof EXPERT_GROUPS)[number];

const GROUP_BY_SLUG: Readonly<Record<string, ExpertGroup>> = {
  "mohammed-mosaad": "design",
  "bassam-jouriyeh": "design",
  "mohammed-abdelalim": "design",
  "amira-al-burtuqali": "design",
  "waseem-asfahan": "quality",
  "abdulrahman-al-muqbil": "data",
};

export function expertGroup(slug: string): ExpertGroup | undefined {
  return GROUP_BY_SLUG[slug];
}

export function filterExperts<T extends { readonly slug: string }>(experts: readonly T[], group: ExpertGroup | undefined): readonly T[] {
  if (!group) {
    return experts;
  }
  return experts.filter((expert) => expertGroup(expert.slug) === group);
}
