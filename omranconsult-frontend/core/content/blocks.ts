export type InlineNode = {
  readonly text: string;
  readonly bold?: boolean;
  readonly italic?: boolean;
  readonly href?: string;
};

export type ContentBlock =
  | { readonly type: "paragraph"; readonly children: readonly InlineNode[] }
  | { readonly type: "heading"; readonly level: "h2" | "h3"; readonly children: readonly InlineNode[] }
  | { readonly type: "list"; readonly style: "bullet" | "number"; readonly items: readonly (readonly InlineNode[])[] }
  | { readonly type: "quote"; readonly children: readonly InlineNode[] };

export function emptyParagraph(): ContentBlock {
  return { type: "paragraph", children: [{ text: "" }] };
}

export function plainText(children: readonly InlineNode[]): string {
  return children.map((child) => child.text).join("");
}

export function hasVisibleText(blocks: readonly ContentBlock[]): boolean {
  return blocks.some((block) => {
    if (block.type === "list") {
      return block.items.some((item) => plainText(item).trim() !== "");
    }
    return plainText(block.children).trim() !== "";
  });
}

/** One unmarked paragraph renders as the old overview subtitle. */
export function plainParagraph(blocks: readonly ContentBlock[]): string | null {
  const block = blocks[0];
  if (blocks.length !== 1 || !block || block.type !== "paragraph" || block.children.length !== 1) {
    return null;
  }
  const child = block.children[0];
  if (!child || child.bold || child.italic || child.href) {
    return null;
  }
  const text = child.text.trim();
  return text === "" ? null : text;
}

export function isAllowedHref(href: string): boolean {
  if (href.startsWith("mailto:")) {
    return /^mailto:[^\s@]+@[^\s@]+$/.test(href);
  }
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function blocksFromUnknown(value: unknown): ContentBlock[] {
  if (typeof value === "string") {
    const text = value.trim();
    return text === "" ? [] : [{ type: "paragraph", children: [{ text }] }];
  }
  if (!Array.isArray(value)) {
    return [];
  }
  const blocks: ContentBlock[] = [];
  for (const entry of value) {
    const block = blockFromUnknown(entry);
    if (block) {
      blocks.push(block);
    }
  }
  return blocks;
}

export function applyTextEdit(children: readonly InlineNode[], next: string): InlineNode[] {
  const previous = plainText(children);
  if (previous === next) {
    return [...children];
  }
  let start = 0;
  const previousEnd = previous.length;
  const nextEnd = next.length;
  while (start < previousEnd && start < nextEnd && previous[start] === next[start]) {
    start += 1;
  }
  let prevCursor = previousEnd;
  let nextCursor = nextEnd;
  while (prevCursor > start && nextCursor > start && previous[prevCursor - 1] === next[nextCursor - 1]) {
    prevCursor -= 1;
    nextCursor -= 1;
  }
  return spliceText(children, start, prevCursor, next.slice(start, nextCursor));
}

export function toggleMark(
  children: readonly InlineNode[],
  start: number,
  end: number,
  mark: "bold" | "italic",
): InlineNode[] {
  if (end <= start) {
    return [...children];
  }
  const enabled = rangeHasMark(children, start, end, mark);
  return mapRange(children, start, end, (node) => ({ ...node, [mark]: enabled ? undefined : true }));
}

export function setLink(children: readonly InlineNode[], start: number, end: number, href: string | null): InlineNode[] {
  if (end <= start) {
    return [...children];
  }
  const next = href && isAllowedHref(href) ? href : undefined;
  return mapRange(children, start, end, (node) => ({ ...node, href: next }));
}

function blockFromUnknown(value: unknown): ContentBlock | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const block = value as { type?: unknown; children?: unknown; items?: unknown; level?: unknown; style?: unknown; text?: unknown };
  if (block.type === "list") {
    const items = Array.isArray(block.items) ? block.items.map((item) => childrenFromUnknown(item)) : [];
    return { type: "list", style: block.style === "number" ? "number" : "bullet", items: items.length > 0 ? items : [[{ text: "" }]] };
  }
  if (block.type !== "paragraph" && block.type !== "heading" && block.type !== "quote") {
    return null;
  }
  const children = childrenFromUnknown(block.children ?? block.text);
  if (block.type === "heading") {
    return { type: "heading", level: block.level === "h3" ? "h3" : "h2", children };
  }
  return { type: block.type, children };
}

function childrenFromUnknown(value: unknown): InlineNode[] {
  if (typeof value === "string") {
    return [{ text: value }];
  }
  if (!Array.isArray(value)) {
    return [{ text: "" }];
  }
  const children: InlineNode[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object" || typeof (entry as { text?: unknown }).text !== "string") {
      continue;
    }
    const node = entry as { text: string; bold?: unknown; italic?: unknown; href?: unknown };
    const next: InlineNode = { text: node.text };
    if (node.bold === true) {
      children.push({ ...next, bold: true, ...(node.italic === true ? { italic: true } : {}), ...(typeof node.href === "string" && isAllowedHref(node.href) ? { href: node.href } : {}) });
      continue;
    }
    children.push({
      ...next,
      ...(node.italic === true ? { italic: true } : {}),
      ...(typeof node.href === "string" && isAllowedHref(node.href) ? { href: node.href } : {}),
    });
  }
  return children.length > 0 ? children : [{ text: "" }];
}

function spliceText(children: readonly InlineNode[], start: number, end: number, inserted: string): InlineNode[] {
  const cleared = flattenEmpty(mapRange(children, start, end, (node) => ({ ...node, text: "" })));
  return insertAt(cleared, start, inserted);
}

function insertAt(children: readonly InlineNode[], index: number, text: string): InlineNode[] {
  if (text === "") {
    return children.length > 0 ? [...children] : [{ text: "" }];
  }
  const next: InlineNode[] = [];
  let cursor = 0;
  let placed = false;
  for (const node of children) {
    const nodeEnd = cursor + node.text.length;
    if (!placed && index <= nodeEnd) {
      const local = index - cursor;
      const before = node.text.slice(0, local);
      const after = node.text.slice(local);
      if (before) {
        next.push({ ...node, text: before });
      }
      next.push({ text });
      if (after) {
        next.push({ ...node, text: after });
      }
      placed = true;
    } else if (node.text !== "") {
      next.push(node);
    }
    cursor = nodeEnd;
  }
  if (!placed) {
    next.push({ text });
  }
  return mergeAdjacent(next.length > 0 ? next : [{ text }]);
}

function mapRange(
  children: readonly InlineNode[],
  start: number,
  end: number,
  update: (node: InlineNode) => InlineNode,
): InlineNode[] {
  const next: InlineNode[] = [];
  let cursor = 0;
  for (const node of children) {
    const nodeEnd = cursor + node.text.length;
    if (nodeEnd <= start || cursor >= end || node.text === "") {
      if (node.text !== "") {
        next.push(node);
      }
      cursor = nodeEnd;
      continue;
    }
    const localStart = Math.max(0, start - cursor);
    const localEnd = Math.min(node.text.length, end - cursor);
    const before = node.text.slice(0, localStart);
    const middle = node.text.slice(localStart, localEnd);
    const after = node.text.slice(localEnd);
    if (before) {
      next.push({ ...node, text: before });
    }
    if (middle) {
      next.push(update({ ...node, text: middle }));
    }
    if (after) {
      next.push({ ...node, text: after });
    }
    cursor = nodeEnd;
  }
  return mergeAdjacent(next.length > 0 ? next : [{ text: "" }]);
}

function rangeHasMark(children: readonly InlineNode[], start: number, end: number, mark: "bold" | "italic"): boolean {
  let cursor = 0;
  let saw = false;
  for (const node of children) {
    const nodeEnd = cursor + node.text.length;
    if (node.text !== "" && nodeEnd > start && cursor < end && !node[mark]) {
      return false;
    }
    if (node.text !== "" && nodeEnd > start && cursor < end) {
      saw = true;
    }
    cursor = nodeEnd;
  }
  return saw;
}

function flattenEmpty(children: readonly InlineNode[]): InlineNode[] {
  const next = children.filter((node) => node.text !== "");
  return next.length > 0 ? next : [{ text: "" }];
}

function mergeAdjacent(children: readonly InlineNode[]): InlineNode[] {
  const next: InlineNode[] = [];
  for (const node of children) {
    const last = next.at(-1);
    if (last && last.bold === node.bold && last.italic === node.italic && last.href === node.href) {
      next[next.length - 1] = { ...last, text: last.text + node.text };
    } else if (node.text !== "") {
      next.push(node);
    }
  }
  return next.length > 0 ? next : [{ text: "" }];
}
