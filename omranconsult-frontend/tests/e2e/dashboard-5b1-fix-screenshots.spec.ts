import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ensureDashboardTheme,
  loginToDashboard,
  resetE2eSeed,
  setDashboardSurface,
  SURFACE_LOCALES,
  SURFACE_THEMES,
  waitReady,
} from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5B-1-fix");
const WIDTHS = [1440, 768, 390] as const;

test.describe("dashboard 5B-1 fix screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("project editor after E1-E7", async ({ page }) => {
    resetE2eSeed();
    mkdirSync(SHOTS, { recursive: true });
    const luminance: string[] = [];
    await loginToDashboard(page);
    await page.goto("/dashboard/projects");
    await waitReady(page);
    const editorHref = (await page.locator("a[data-project-id]").first().getAttribute("href")) ?? "/dashboard/projects";

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          await page.goto(editorHref);
          await waitReady(page);
          await ensureDashboardTheme(page, theme);
          if (width === 390) {
            const overflow = await page.evaluate(
              () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            );
            expect(overflow, `overflow at ${locale}-${theme}-390`).toBeLessThanOrEqual(0);
          }
          if (theme === "dark" && width === 1440 && locale === "ar") {
            const value = await page.locator("[data-dashboard-surface]").evaluate((el) => {
              const color = getComputedStyle(el).backgroundColor;
              const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
              if (!match) {
                return -1;
              }
              return Math.round(0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]));
            });
            luminance.push(`project-edit-ar-dark-1440 ${value}`);
            expect(value).toBeLessThan(60);
          }
          await page.screenshot({
            fullPage: true,
            path: path.join(SHOTS, `project-edit-${locale}-${theme}-${width}.png`),
          });
        }
      }
    }
    writeFileSync(path.join(SHOTS, "luminance.txt"), `${luminance.join("\n")}\n`);
  });
});
