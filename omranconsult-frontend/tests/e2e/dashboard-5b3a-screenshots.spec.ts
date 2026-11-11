import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { ensureDashboardTheme, loginToDashboard, resetE2eSeed, setDashboardSurface, waitReady } from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5B-3a");

const SURFACES = [
  { locale: "ar" as const, theme: "light" as const, width: 1440 },
  { locale: "ar" as const, theme: "light" as const, width: 390 },
  { locale: "ar" as const, theme: "dark" as const, width: 1440 },
  { locale: "ar" as const, theme: "dark" as const, width: 390 },
  { locale: "en" as const, theme: "light" as const, width: 1440 },
];

type Target = { name: string; href: string; prepare?: (page: Page) => Promise<void> };

async function blockHref(page: Page, pageKey: string, section: string): Promise<string> {
  await page.goto("/dashboard/pages");
  await waitReady(page);
  await page.locator(`[data-page-card="${pageKey}"] [data-block-link="${section}"]`).click();
  await page.waitForURL(/\/dashboard\/pages\/blocks\/\d+$/);
  return new URL(page.url()).pathname;
}

test.describe("dashboard 5B-3a screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("site pages, block editor, slides, statistics and Home sectors", async ({ page }) => {
    resetE2eSeed();
    mkdirSync(SHOTS, { recursive: true });
    const luminance: string[] = [];
    await loginToDashboard(page);
    await setDashboardSurface(page, "ar", "light", 1440);

    const targets: Target[] = [
      { name: "pages-list", href: "/dashboard/pages" },
      { name: "block-about-design-copy", href: await blockHref(page, "about", "design_copy") },
      { name: "block-home-service-cards", href: await blockHref(page, "home", "service_highlights") },
      { name: "slides", href: "/dashboard/pages?tab=slides" },
      {
        name: "slide-editor",
        href: "/dashboard/pages?tab=slides",
        prepare: async (current) => {
          // Desktop rows keep the seeded order (vision is the sixth); the mobile cards carry the key.
          await current.locator('[data-dashboard-row]:nth-child(6), [data-slide-key="vision"]').filter({ visible: true }).first().click();
          await expect(current.locator("[data-slide-editor]")).toBeVisible();
        },
      },
      { name: "statistics", href: "/dashboard/pages?tab=statistics" },
      {
        name: "statistic-editor",
        href: "/dashboard/pages?tab=statistics",
        prepare: async (current) => {
          await current.locator('[data-dashboard-row]:nth-child(2), [data-statistic-key="project_volume"]').filter({ visible: true }).first().click();
          await expect(current.locator('[data-statistic-editor="project_volume"]')).toBeVisible();
        },
      },
      { name: "home-sectors", href: "/dashboard/pages?tab=sectors" },
    ];

    for (const surface of SURFACES) {
      await setDashboardSurface(page, surface.locale, surface.theme, surface.width);
      for (const target of targets) {
        await page.goto(target.href);
        await waitReady(page);
        await ensureDashboardTheme(page, surface.theme);
        await target.prepare?.(page);

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `overflow ${target.name}-${surface.locale}-${surface.theme}-${surface.width}`).toBeLessThanOrEqual(0);

        if (surface.width === 1440) {
          // Tables fit without a horizontal scrollbar and row actions are never clipped.
          const clipped = await page.locator("[data-dashboard-table]").evaluateAll((nodes) => nodes.filter((node) => node.scrollWidth > node.clientWidth + 1).length);
          expect(clipped, `table scroll ${target.name}`).toBe(0);
        }

        if (surface.theme === "dark" && surface.width === 1440 && surface.locale === "ar") {
          const value = await page.locator("[data-dashboard-surface]").evaluate((el) => {
            const match = getComputedStyle(el).backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            return match ? Math.round(0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3])) : -1;
          });
          luminance.push(`${target.name}-ar-dark-1440 ${value}`);
          expect(value).toBeLessThan(60);
        }

        if (surface.locale === "ar") {
          // No raw keys, ISO dates or English statuses in Arabic mode (owner rule).
          const text = await page.locator("main").innerText();
          expect(text, target.name).not.toMatch(/[a-z]+_[a-z0-9_]+/);
          expect(text, target.name).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
          expect(text, target.name).not.toMatch(/\bpublished\b/i);
        }

        await page.screenshot({ fullPage: true, path: path.join(SHOTS, `${target.name}-${surface.locale}-${surface.theme}-${surface.width}.png`) });
      }
    }

    // Public pages the task touches: the Home sector chips keep the design order until an editor publishes one.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/ar");
    const projects = page.locator('[data-section="projects"]');
    await projects.scrollIntoViewIfNeeded();
    await expect(projects.locator("button[aria-pressed]")).toHaveText(["الكل", "التعليم", "الصحة", "المياه والبيئة", "البنية التحتية", "الجامعات"]);
    await projects.screenshot({ path: path.join(SHOTS, "public-home-sectors-ar-light-1440.png") });

    writeFileSync(path.join(SHOTS, "luminance.txt"), `${luminance.join("\n")}\n`);
  });
});
