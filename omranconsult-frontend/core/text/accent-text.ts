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
const ACCENT_OPEN = "{accent}";
const ACCENT_CLOSE = "{/accent}";

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

export function hasAccentMarkers(value: string): boolean {
  return /\{accent\}([\s\S]*?)\{\/accent\}/.test(value);
}

/** Wrap the selected range in accent markers (one highlight; replaces any prior markers in the selection). */
export function wrapAccentRange(value: string, start: number, end: number): string {
  if (start < 0 || end < start || end > value.length || start === end) {
    return value;
  }
  const selected = stripAccentMarkers(value.slice(start, end));
  if (!selected) {
    return value;
  }
  return `${value.slice(0, start)}${ACCENT_OPEN}${selected}${ACCENT_CLOSE}${value.slice(end)}`;
}

/** Clear every accent marker while keeping the words. */
export function clearAccentMarkers(value: string): string {
  return value.replace(ACCENT_PATTERN, "$1");
}
