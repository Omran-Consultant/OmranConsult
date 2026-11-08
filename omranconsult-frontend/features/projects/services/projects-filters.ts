/** Cards per page on desktop; the mobile list grows by the same step («عرض المزيد»). */
export const PAGE_SIZE = 9;

/** The API caps `per_page` at 100, so the cumulative mobile list stops at 11 pages. */
export const MAX_PAGE = Math.floor(100 / PAGE_SIZE);

export type ProjectsFilters = {
  readonly sector?: string;
  readonly q?: string;
  readonly client?: string;
  readonly region?: string;
  readonly page: number;
};

type RawSearchParams = Readonly<Record<string, string | string[] | undefined>>;

const SLUG_PATTERN = /^[a-z0-9-]{1,120}$/;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function slug(value: string | string[] | undefined): string | undefined {
  const candidate = first(value)?.trim();
  return candidate && SLUG_PATTERN.test(candidate) ? candidate : undefined;
}

/** Search text the API accepts (`q`: 2–100 characters); anything else is ignored. */
export function searchTerm(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length >= 2 && trimmed.length <= 100 ? trimmed : undefined;
}

export function parseProjectsFilters(params: RawSearchParams): ProjectsFilters {
  const page = Number.parseInt(first(params.page) ?? "", 10);
  return {
    sector: slug(params.sector),
    q: searchTerm(first(params.q)),
    client: slug(params.client),
    region: slug(params.region),
    page: Number.isFinite(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1,
  };
}

/** Query string for `/projects` (page 1 is omitted); `overrides` replace single keys. */
export function projectsQuery(filters: ProjectsFilters, overrides: Partial<Omit<ProjectsFilters, "page">> & { page?: number } = {}): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  for (const key of ["sector", "q", "client", "region"] as const) {
    const value = merged[key];
    if (value) {
      params.set(key, value);
    }
  }
  if (merged.page && merged.page > 1) {
    params.set("page", String(merged.page));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(filters: ProjectsFilters): boolean {
  return Boolean(filters.sector || filters.q || filters.client || filters.region);
}

/** Page numbers with gaps, as in the Figma pagination (‹ 1 2 3 … 23 ›). */
export function pageWindow(current: number, last: number): (number | "gap")[] {
  const pages = new Set([1, last, current - 1, current, current + 1].filter((page) => page >= 1 && page <= last));
  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) {
      result.push(page - previous === 2 ? previous + 1 : "gap");
    }
    result.push(page);
  });
  return result;
}

/** Gallery images other than the hero photo; the section is hidden when none remain. */
export function galleryImages(gallery: readonly string[], heroKey: string | undefined): string[] {
  return [...new Set(gallery)].filter((key) => key !== heroKey);
}
