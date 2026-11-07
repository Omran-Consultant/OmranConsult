/**
 * Seeded design copy marks one accent word as `{accent}…{/accent}` and line breaks as "\n"
 * (PHASE4C D4). The API never sends HTML; this parser turns the markers into segments.
 */
export type AccentSegment = {
  readonly text: string;
  readonly accent: boolean;
};

export type AccentLine = readonly AccentSegment[];

const ACCENT_PATTERN = /\{accent\}([\s\S]*?)\{\/accent\}/g;

function parseLine(line: string): AccentLine {
  const segments: AccentSegment[] = [];
  let cursor = 0;

  for (const match of line.matchAll(ACCENT_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      segments.push({ text: line.slice(cursor, start), accent: false });
    }
    segments.push({ text: match[1] ?? "", accent: true });
    cursor = start + match[0].length;
  }

  if (cursor < line.length) {
    segments.push({ text: line.slice(cursor), accent: false });
  }

  return segments.filter((segment) => segment.text.length > 0);
}

export function parseAccentText(value: string): readonly AccentLine[] {
  return value
    .split(/\r?\n/)
    .map(parseLine)
    .filter((line) => line.length > 0);
}

/** Plain text without markers, for metadata and accessible names. */
export function stripAccentMarkers(value: string): string {
  return value.replace(ACCENT_PATTERN, "$1").replace(/\s*\r?\n\s*/g, " ").trim();
}
