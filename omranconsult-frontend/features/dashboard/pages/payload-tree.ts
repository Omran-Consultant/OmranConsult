/**
 * Pure helpers for editing a content block payload as a tree (5B-3a). The API keeps the seeded shape
 * of every block (maps, lists, translation maps and a few plain strings), so the editor walks the
 * payload it loaded instead of a hand-written form per block.
 */

export type TranslationMap = { ar: string | null; en: string | null };
export type PayloadNode = string | number | boolean | null | PayloadNode[] | { [key: string]: PayloadNode };
export type PayloadPath = readonly (string | number)[];
export type EditorLocale = "ar" | "en";

export function isTranslationMap(node: PayloadNode): node is TranslationMap {
  if (node === null || typeof node !== "object" || Array.isArray(node)) {
    return false;
  }
  const keys = Object.keys(node).sort();
  return (
    keys.length === 2 &&
    keys[0] === "ar" &&
    keys[1] === "en" &&
    (typeof node.ar === "string" || node.ar === null) &&
    (typeof node.en === "string" || node.en === null)
  );
}

export function isRecord(node: PayloadNode): node is { [key: string]: PayloadNode } {
  return node !== null && typeof node === "object" && !Array.isArray(node);
}

/** A copy of `root` with the node at `path` replaced; siblings keep their identity. */
export function setAtPath(root: PayloadNode, path: PayloadPath, value: PayloadNode): PayloadNode {
  if (path.length === 0) {
    return value;
  }
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    return root.map((item, index) => (index === head ? setAtPath(item, rest, value) : item));
  }
  if (isRecord(root)) {
    return { ...root, [String(head)]: setAtPath(root[String(head)] ?? null, rest, value) };
  }
  return root;
}

/**
 * An empty item for a list, in the shape of an existing item: text is blank in both languages,
 * while plain strings (an icon key, a link) keep the sibling's value so the item stays valid.
 */
export function blankLike(template: PayloadNode): PayloadNode {
  if (isTranslationMap(template)) {
    return { ar: "", en: "" };
  }
  if (Array.isArray(template)) {
    return template.length > 0 ? [blankLike(template[0] ?? null)] : [];
  }
  if (isRecord(template)) {
    return Object.fromEntries(Object.entries(template).map(([key, child]) => [key, blankLike(child)]));
  }
  return template;
}

export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

/** How many translation maps the payload holds, and how many are filled in the locale. */
export function completeness(root: PayloadNode, locale: EditorLocale): { filled: number; total: number } {
  if (isTranslationMap(root)) {
    const other = locale === "ar" ? root.en : root.ar;
    const mine = root[locale];
    // A map that is blank in both languages is an unused optional text, not a missing translation.
    if (!mine?.trim() && !other?.trim()) {
      return { filled: 0, total: 0 };
    }
    return { filled: mine?.trim() ? 1 : 0, total: 1 };
  }
  const children = Array.isArray(root) ? root : isRecord(root) ? Object.values(root) : [];
  return children.reduce<{ filled: number; total: number }>(
    (sum, child) => {
      const part = completeness(child, locale);
      return { filled: sum.filled + part.filled, total: sum.total + part.total };
    },
    { filled: 0, total: 0 },
  );
}

/** Long or multi-line text gets a textarea; a title stays a one-line field. */
export function isLongText(map: TranslationMap): boolean {
  return [map.ar, map.en].some((value) => typeof value === "string" && (value.length > 90 || value.includes("\n")));
}

/** `payload.hero.stat_labels.project_volume` → ["hero", "stat_labels", "project_volume"]; list indexes become numbers. */
export function parseFieldPath(field: string): (string | number)[] {
  return field
    .split(".")
    .slice(1)
    .map((part) => (/^\d+$/.test(part) ? Number(part) : part));
}
