export function resolveOrgGroupHeading(
  titles: Record<string, unknown> | undefined,
  groupKey: string,
): string | undefined {
  const value = titles?.[groupKey];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
