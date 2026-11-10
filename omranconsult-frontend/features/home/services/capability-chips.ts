const MAX_CHIPS = 3;

/** Featured service chips: the profile repeats some service titles, so show each one once (V3). */
export function capabilityChips(titles: readonly (string | undefined)[]): string[] {
  const seen = new Set<string>();
  const chips: string[] = [];
  for (const title of titles) {
    const normalized = title?.replace(/\s+/g, " ").trim();
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      chips.push(normalized);
    }
  }
  return chips.slice(0, MAX_CHIPS);
}
