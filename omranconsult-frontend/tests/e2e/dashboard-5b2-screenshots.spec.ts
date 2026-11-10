import { expect, test, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  ensureDashboardTheme,
  loginToDashboard,
  resetE2eSeed,
  setDashboardSurface,
  SURFACE_LOCALES,
  SURFACE_THEMES,
  SURFACE_WIDTHS,
  waitReady,
} from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5B-2");

async function firstHref(page: Page, selector: string, fallback: string): Promise<string> {
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) {
    return fallback;
  }
  return (await locator.getAttribute("href")) ?? fallback;
}

test.describe("dashboard 5B-2 screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("services and news editors plus affected public pages", async ({ page }) => {
    resetE2eSeed();
    mkdirSync(SHOTS, { recursive: true });
    const luminance: string[] = [];
    await loginToDashboard(page);

    await page.goto("/dashboard/services");
    await waitReady(page);
    const categoryEdit = page.getByRole("button", { name: /^(Edit|تعديل)$/ }).first();
    await expect(categoryEdit).toBeVisible();
    await categoryEdit.click();
    await page.waitForURL(/\/dashboard\/services\/categories\/\d+/);
    const categoryHref = new URL(page.url()).pathname;
    await page.goto("/dashboard/services");
    await waitReady(page);
    await page.getByRole("button", { name: /^(Edit|تعديل)$/ }).nth(1).click();
    await page.waitForURL(/\/dashboard\/services\/items\/\d+/);
    const itemHref = new URL(page.url()).pathname;

    await page.goto("/dashboard/news");
    await waitReady(page);
    await expect(page.locator("a[data-news-id]").first()).toBeVisible();
    const newsHref = await firstHref(page, "a[data-news-id]", "/dashboard/news");

    await page.goto("/ar/media");
    const articleHref = await firstHref(page, 'a[href*="/media/"]', "/ar/media");

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          for (const target of [
            { href: "/dashboard/services", name: "services" },
            { href: categoryHref, name: "service-category" },
            { href: itemHref, name: "service-item" },
            { href: "/dashboard/news", name: "news" },
            { href: newsHref, name: "news-edit" },
          ]) {
            await page.goto(target.href);
            await waitReady(page);
            await ensureDashboardTheme(page, theme);
            if (theme === "dark" && width === 1440 && locale === "ar") {
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
            await page.screenshot({ fullPage: true, path: path.join(SHOTS, `${target.name}-${locale}-${theme}-${width}.png`) });
          }
        }
      }
    }

    writeFileSync(path.join(SHOTS, "luminance.txt"), `${luminance.join("\n")}\n`);

    const origin = `http://localhost:${process.env.E2E_PORT ?? "3000"}`;
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
          await page.context().addCookies([{ name: "oc-theme", value: theme, url: origin }]);
          const articlePath = articleHref.replace(/^\/(ar|en)/, `/${locale}`);
          for (const target of [
            { name: "public-services", href: `/${locale}/services` },
            { name: "public-media", href: `/${locale}/media` },
            { name: "public-article", href: articlePath },
          ]) {
            await page.goto(target.href);
            await page.evaluate((next) => {
              localStorage.setItem("oc-theme", next);
              document.documentElement.classList.toggle("dark", next === "dark");
            }, theme);
            await page.screenshot({ fullPage: true, path: path.join(SHOTS, `${target.name}-${locale}-${theme}-${width}.png`) });
          }
        }
      }
    }
  });
});
