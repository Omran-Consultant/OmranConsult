import { z } from "zod";

/** Posts per «تحميل المزيد» step (the 3×2 grid). */
export const NEWS_PAGE_SIZE = 6;

/** The API caps `per_page` at 50, so the cumulative list stops at 8 steps. */
export const MAX_NEWS_PAGE = Math.floor(50 / NEWS_PAGE_SIZE);

/** Arabic and English reading speed used for «N دقائق قراءة». */
const WORDS_PER_MINUTE = 200;

const text = z.string().trim().min(1).optional().catch(undefined);
const titled = z.object({ title: text, text }).catch({}).default({});

/** Media Center design copy (SDD P22, page `media`). */
export const mediaCopySchema = z
  .object({ title: text, intro: text, newsletter: titled, article_cta: titled })
  .catch({ newsletter: {}, article_cta: {} });

export type MediaCopy = z.infer<typeof mediaCopySchema>;

export type MediaFilters = {
  readonly category?: string;
  readonly page: number;
};

type RawSearchParams = Readonly<Record<string, string | string[] | undefined>>;

const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseMediaFilters(params: RawSearchParams): MediaFilters {
  const category = first(params.category)?.trim();
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return {
    category: category && SLUG_PATTERN.test(category) ? category : undefined,
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, MAX_NEWS_PAGE) : 1,
  };
}

/** Query string for `/media` (page 1 and «الكل» are omitted). */
export function mediaQuery(filters: MediaFilters, overrides: Partial<MediaFilters> = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.category) {
    params.set("category", merged.category);
  }
  if (merged.page > 1) {
    params.set("page", String(merged.page));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

type RawBlock = { readonly type: string; readonly text?: string | null; readonly image?: string | null };

export type ArticleBlock =
  | { readonly type: "paragraph" | "heading" | "quote"; readonly text: string }
  | { readonly type: "image"; readonly image: string };

/** Known block types with content (Q9); anything else is dropped. */
export function articleBlocks(raw: readonly RawBlock[] | undefined): ArticleBlock[] {
  return (raw ?? []).flatMap((block): ArticleBlock[] => {
    if ((block.type === "paragraph" || block.type === "heading" || block.type === "quote") && block.text?.trim()) {
      return [{ type: block.type, text: block.text.trim() }];
    }
    if (block.type === "image" && block.image?.trim()) {
      return [{ type: "image", image: block.image.trim() }];
    }
    return [];
  });
}

/** Whole minutes to read the text blocks; undefined when there is no body text. */
export function readingMinutes(blocks: readonly ArticleBlock[]): number | undefined {
  const words = blocks.reduce((total, block) => (block.type === "image" ? total : total + block.text.split(/\s+/).filter(Boolean).length), 0);
  return words > 0 ? Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) : undefined;
}
