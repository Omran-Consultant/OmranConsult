import { expect, test, type Page } from "@playwright/test";

import { scrollThroughPage, unloadedImages } from "./scroll-images.mjs";

/**
 * SITE_POLISH P3: editor-shaped extremes from `e2e:prepare-database` (robustnessFixtures).
 * The long titles are 120 characters, the long project and article have no image, and their
 * bodies hold every block type.
 */
const LONG_PROJECT = "king-abdulaziz-hospital-site-development";
const SHORT_PROJECT = "investment-consulting-framework-agreement";
const LONG_NEWS = "partnerships-with-international-firms";
const SHORT_NEWS = "national-asset-management-guide-education";
const LONG_TITLE_START = { ar: "مشروع تجريبي بعنوان طويل جداً", en: "A deliberately long project title" } as const;
const LONG_NEWS_START = { ar: "خبر تجريبي بعنوان طويل جداً", en: "A deliberately long news headline" } as const;
const SHORT_TITLE = { ar: { project: "مركز", news: "دليل" }, en: { project: "Hub", news: "Guide" } } as const;

async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

async function brokenImages(page: Page): Promise<string[]> {
  await scrollThroughPage(page);
  return unloadedImages(page, 20_000);
}

/** Every card in a grid row starts at the same top and has the same width. */
async function gridIsEven(page: Page, selector: string) {
  const boxes = await page.locator(selector).evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { top: Math.round(rect.top + window.scrollY), width: Math.round(rect.width), height: Math.round(rect.height) };
    }),
  );
  expect(boxes.length).toBeGreaterThan(0);
  const rows = new Map<number, { width: number; height: number }[]>();
  for (const box of boxes) {
    rows.set(box.top, [...(rows.get(box.top) ?? []), box]);
  }
  for (const row of rows.values()) {
    const widths = row.map((box) => box.width);
    const heights = row.map((box) => box.height);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(2);
  }
}

for (const locale of ["ar", "en"] as const) {
  for (const width of [390, 1440]) {
    test.describe(`${locale} at ${width}`, () => {
      test.use({ viewport: { width, height: width === 390 ? 844 : 900 } });

      test("a 120-character project with no image and every block type", async ({ page }) => {
        await page.goto(`/${locale}/projects/${LONG_PROJECT}`);
        await expect(page.locator("h1")).toContainText(LONG_TITLE_START[locale]);
        const body = page.locator('[data-section="body"]');
        for (const tag of ["h2", "h3", "ul li", "ol li", "blockquote", "strong", "em", "a[href='https://omranconsult.com']"]) {
          await expect(body.locator(tag).first()).toBeVisible();
        }
        expect(await overflow(page)).toBe(0);
        expect(await brokenImages(page)).toEqual([]);
      });

      test("a one-word project title", async ({ page }) => {
        await page.goto(`/${locale}/projects/${SHORT_PROJECT}`);
        await expect(page.locator("h1")).toHaveText(SHORT_TITLE[locale].project);
        expect(await overflow(page)).toBe(0);
      });

      test("a 120-character article with no cover and every block type", async ({ page }) => {
        await page.goto(`/${locale}/media/${LONG_NEWS}`);
        await expect(page.locator("h1")).toContainText(LONG_NEWS_START[locale]);
        const body = page.locator('[data-section="body"]');
        for (const tag of ["h2", "h3", "ul li", "ol li", "blockquote", "strong", "em", "img"]) {
          await expect(body.locator(tag).first()).toBeVisible();
        }
        expect(await overflow(page)).toBe(0);
        expect(await brokenImages(page)).toEqual([]);
      });

      test("a one-word article title", async ({ page }) => {
        await page.goto(`/${locale}/media/${SHORT_NEWS}`);
        await expect(page.locator("h1")).toHaveText(SHORT_TITLE[locale].news);
        expect(await overflow(page)).toBe(0);
      });

      test("the projects grid keeps even cards around the extremes", async ({ page }) => {
        // The health sector holds the long project, so it is on the first page.
        await page.goto(`/${locale}/projects?sector=health`);
        await expect(page.getByText(LONG_TITLE_START[locale]).filter({ visible: true }).first()).toBeVisible();
        await gridIsEven(page, '[data-section="grid"] ul > li');
        expect(await overflow(page)).toBe(0);
        expect(await brokenImages(page)).toEqual([]);
      });

      test("the media grid keeps even cards around the extremes", async ({ page }) => {
        await page.goto(`/${locale}/media?page=2`);
        await expect(page.getByText(LONG_NEWS_START[locale]).filter({ visible: true }).first()).toBeVisible();
        await gridIsEven(page, '[data-section="grid"] ul > li');
        expect(await overflow(page)).toBe(0);
        expect(await brokenImages(page)).toEqual([]);
      });

      test("home shows the long featured project without overflow", async ({ page }) => {
        await page.goto(`/${locale}`);
        await expect(page.getByText(LONG_TITLE_START[locale]).first()).toBeAttached();
        expect(await overflow(page)).toBe(0);
        expect(await brokenImages(page)).toEqual([]);
      });
    });
  }
}
