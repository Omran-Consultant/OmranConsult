import { expect, test } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ensureDashboardTheme,
  loginToDashboard,
  resetE2eSeed,
  setDashboardSurface,
  waitReady,
} from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5B-2-fix");

const SURFACES = [
  { locale: "ar" as const, theme: "light" as const, width: 1440 },
  { locale: "ar" as const, theme: "light" as const, width: 390 },
  { locale: "ar" as const, theme: "dark" as const, width: 1440 },
  { locale: "ar" as const, theme: "dark" as const, width: 390 },
  { locale: "en" as const, theme: "light" as const, width: 1440 },
];

test.describe("dashboard 5B-2 fix screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("news and services after N1-N4", async ({ page }) => {
    resetE2eSeed();
    mkdirSync(SHOTS, { recursive: true });
    const luminance: string[] = [];
    await loginToDashboard(page);

    await page.goto("/dashboard/services");
    await waitReady(page);
    const categoryId = await page.locator("[data-category-id]").first().getAttribute("data-category-id");
    const serviceId = await page.locator("[data-service-id]").first().getAttribute("data-service-id");
    expect(categoryId).toBeTruthy();
    expect(serviceId).toBeTruthy();

    await page.goto("/dashboard/news");
    await waitReady(page);
    const newsHref = (await page.locator("a[data-news-id]").first().getAttribute("href")) ?? "/dashboard/news";

    const targets = [
      { href: "/dashboard/news", name: "news-list" },
      { href: newsHref, name: "news-edit" },
      { href: "/dashboard/services", name: "services-list" },
      { href: `/dashboard/services/categories/${categoryId}`, name: "service-category" },
      { href: `/dashboard/services/items/${serviceId}`, name: "service-item" },
    ];

    for (const surface of SURFACES) {
      await setDashboardSurface(page, surface.locale, surface.theme, surface.width);
      for (const target of targets) {
        await page.goto(target.href);
        await waitReady(page);
        await ensureDashboardTheme(page, surface.theme);

        if (surface.width === 390) {
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          expect(overflow, `overflow ${target.name}-${surface.locale}-${surface.theme}-390`).toBeLessThanOrEqual(0);
        }

        if (surface.theme === "dark" && surface.width === 1440 && surface.locale === "ar") {
          const value = await page.locator("[data-dashboard-surface]").evaluate((el) => {
            const color = getComputedStyle(el).backgroundColor;
            const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) {
              return -1;
            }
            return Math.round(0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]));
          });
          luminance.push(`${target.name}-ar-dark-1440 ${value}`);
          expect(value).toBeLessThan(60);
        }

        if (target.name === "news-edit" && surface.locale === "ar" && surface.width === 1440 && surface.theme === "light") {
          const body = (await page.locator("#body-ar").inputValue()).trim();
          expect(body.length, "news edit body must load").toBeGreaterThan(0);
        }

        if (target.name === "service-category" && surface.locale === "ar" && surface.width === 1440) {
          await expect(page.locator("[data-icon-picker]")).toBeVisible();
          const pickerText = await page.locator("[data-icon-picker]").innerText();
          expect(pickerText).not.toMatch(/\bhard-hat\b/);
        }

        if (target.name === "news-edit") {
          await expect(page.locator("[data-cover-field]")).toBeVisible();
          const coverText = await page.locator("[data-cover-field]").innerText();
          expect(coverText).not.toMatch(/\bdigital\b/);
          expect(coverText).not.toMatch(/media #\d+/);
        }

        await page.screenshot({
          fullPage: true,
          path: path.join(SHOTS, `${target.name}-${surface.locale}-${surface.theme}-${surface.width}.png`),
        });
      }
    }

    writeFileSync(path.join(SHOTS, "luminance.txt"), `${luminance.join("\n")}\n`);
  });
});
