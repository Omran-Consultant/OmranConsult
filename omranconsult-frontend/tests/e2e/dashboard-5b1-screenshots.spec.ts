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
  SURFACE_WIDTHS,
  waitReady,
} from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5B-1");

test.describe("dashboard 5B-1 screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("projects editor and affected public pages", async ({ page }) => {
    resetE2eSeed();
    mkdirSync(SHOTS, { recursive: true });
    const luminance: string[] = [];
    await loginToDashboard(page);
    await page.goto("/dashboard/projects");
    await waitReady(page);
    await expect(page.locator("a[data-project-id]").first()).toBeVisible();
    const editorHref = (await page.locator("a[data-project-id]").first().getAttribute("href")) ?? "/dashboard/projects";
    const slug = (await page.locator("a[data-project-id]").first().getAttribute("data-slug")) ?? "";

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          for (const target of [
            { href: "/dashboard/projects", name: "projects" },
            { href: editorHref, name: "project-edit" },
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

    await setDashboardSurface(page, "ar", "dark", 1440);
    await page.goto("/dashboard/ui-gallery");
    await waitReady(page);
    await ensureDashboardTheme(page, "dark");
    const galleryLuminance = await page.locator("[data-dashboard-surface]").evaluate((el) => {
      const color = getComputedStyle(el).backgroundColor;
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (!match) {
        return -1;
      }
      return Math.round(0.2126 * Number(match[1]) + 0.7152 * Number(match[2]) + 0.0722 * Number(match[3]));
    });
    luminance.push(`ui-gallery-dark ${galleryLuminance}`);
    expect(galleryLuminance).toBeLessThan(60);
    await page.screenshot({ fullPage: true, path: path.join(SHOTS, "ui-gallery-ar-dark-1440.png") });
    writeFileSync(path.join(SHOTS, "luminance.txt"), `${luminance.join("\n")}\n`);

    const origin = `http://localhost:${process.env.E2E_PORT ?? "3000"}`;
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
          await page.context().addCookies([{ name: "oc-theme", value: theme, url: origin }]);
          for (const target of [
            { name: "public-home", href: `/${locale}` },
            { name: "public-projects", href: `/${locale}/projects` },
            { name: "public-detail", href: `/${locale}/projects/${slug}` },
          ]) {
            await page.goto(target.href);
            await page.evaluate((next) => {
              localStorage.setItem("oc-theme", next);
              document.documentElement.classList.toggle("dark", next === "dark");
            }, theme);
            if (target.name === "public-detail" && locale === "ar" && theme === "light" && width === 1440) {
              // Test copy must not leak into this project's own sections. Related cards are excluded:
              // the E2E seed has robustness projects whose long titles contain «لاختبار».
              for (const section of ["hero", "facts-bar", "body"]) {
                await expect(page.locator(`[data-section="${section}"]`).getByText("لاختبار")).toHaveCount(0);
              }
              await expect(page.getByRole("link", { name: "مشاريع أخرى للجهة نفسها" })).toBeVisible();
            }
            await page.screenshot({ fullPage: true, path: path.join(SHOTS, `${target.name}-${locale}-${theme}-${width}.png`) });
          }
        }
      }
    }
  });
});
