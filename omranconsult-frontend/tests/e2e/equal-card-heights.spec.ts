import { expect, test, type Page } from "@playwright/test";

type Grid = {
  readonly name: string;
  readonly path: string;
  /** The list whose direct children are the cards. */
  readonly list: string;
  /** The pinned footer row inside each card, when the card has one. */
  readonly footer?: string;
};

const GRIDS: readonly Grid[] = [
  { name: "home service highlights", path: "", list: '[data-section="services"] ul', footer: "[data-card-footer]" },
  { name: "services axes", path: "/services", list: '[data-section="pillars"] ol', footer: "[data-card-footer]" },
  { name: "services tools", path: "/services", list: '[data-section="tools"] ul' },
  { name: "projects grid", path: "/projects", list: '[data-section="grid"] ul:first-of-type', footer: "[data-card-footer]" },
  { name: "news grid", path: "/media", list: '[data-section="grid"] ul', footer: "[data-card-footer]" },
  { name: "partners", path: "/about", list: '[data-section="partners"] ul' },
];

const WIDTHS = [768, 1024, 1440] as const;

type Measured = { readonly top: number; readonly height: number; readonly footerTop: number | null };

async function measure(page: Page, grid: Grid): Promise<Measured[]> {
  return page.locator(grid.list).first().evaluate((list, footerSelector) => {
    return Array.from(list.children).map((item) => {
      const box = item.getBoundingClientRect();
      const footer = footerSelector ? item.querySelector(footerSelector) : null;
      return {
        top: Math.round(box.top + window.scrollY),
        height: Math.round(box.height),
        footerTop: footer ? Math.round(footer.getBoundingClientRect().top + window.scrollY) : null,
      };
    });
  }, grid.footer ?? null);
}

for (const locale of ["en", "ar"] as const) {
  for (const grid of GRIDS) {
    test(`${grid.name} cards share one height per row (${locale})`, async ({ page }) => {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}${grid.path}`);
        await page.locator(grid.list).first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        const cards = await measure(page, grid);
        expect(cards.length, `${grid.name} @${width}`).toBeGreaterThan(1);

        const rows = new Map<number, Measured[]>();
        for (const card of cards) {
          const key = [...rows.keys()].find((top) => Math.abs(top - card.top) <= 2) ?? card.top;
          rows.set(key, [...(rows.get(key) ?? []), card]);
        }

        for (const row of rows.values()) {
          if (row.length < 2) {
            // Single-column layouts (for example axes below 1024) may differ in height.
            continue;
          }
          const heights = row.map((card) => card.height);
          expect(Math.max(...heights) - Math.min(...heights), `${grid.name} @${width} heights`).toBeLessThanOrEqual(1);
          const footers = row.flatMap((card) => (card.footerTop === null ? [] : [card.footerTop]));
          if (grid.footer && footers.length > 1) {
            expect(Math.max(...footers) - Math.min(...footers), `${grid.name} @${width} footers`).toBeLessThanOrEqual(1);
          }
        }
      }
    });
  }
}
