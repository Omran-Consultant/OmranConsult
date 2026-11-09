import { test } from "@playwright/test";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  ensureDashboardTheme,
  loginToDashboard,
  setDashboardSurface,
  SURFACE_LOCALES,
  SURFACE_THEMES,
  SURFACE_WIDTHS,
  waitReady,
} from "./dashboard-helpers";

const UI_SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5A-ui");
const FIGMA = path.join(process.cwd(), "..", "docs", "design-reference", "figma-screens");

test.describe("dashboard 5A-ui screenshots", () => {
  test.describe.configure({ timeout: 1_200_000 });

  test("matrix and compare images", async ({ page }) => {
    mkdirSync(UI_SHOTS, { recursive: true });

    const guestTargets = [
      { href: "/dashboard/login", name: "login" },
    ] as const;

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          for (const target of guestTargets) {
            await page.goto(target.href);
            await waitReady(page);
            await ensureDashboardTheme(page, theme);
            await page.screenshot({
              fullPage: true,
              path: path.join(UI_SHOTS, `${target.name}-${locale}-${theme}-${width}.png`),
            });
          }
        }
      }
    }

    await loginToDashboard(page);

    const targets = [
      { href: "/dashboard", name: "home" },
      { href: "/dashboard/projects", name: "projects" },
      { href: "/dashboard/users", name: "users" },
      { href: "/dashboard/activity", name: "activity" },
      { href: "/dashboard/media", name: "media" },
      { href: "/dashboard/profile", name: "profile" },
      { href: "/dashboard/forbidden", name: "no-permission" },
      { href: "/dashboard/ui-gallery", name: "ui-gallery" },
    ] as const;

    let projectHref = "/dashboard/projects";
    await page.goto("/dashboard/projects");
    await waitReady(page);
    const projectLink = page.locator("a[data-project-id]").first();
    if ((await projectLink.count()) > 0) {
      projectHref = (await projectLink.getAttribute("href")) ?? projectHref;
    }

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          for (const target of targets) {
            await page.goto(target.href);
            await waitReady(page);
            await ensureDashboardTheme(page, theme);
            await page.screenshot({
              fullPage: true,
              path: path.join(UI_SHOTS, `${target.name}-${locale}-${theme}-${width}.png`),
            });
          }
          await page.goto(projectHref);
          await waitReady(page);
          await ensureDashboardTheme(page, theme);
          await page.screenshot({
            fullPage: true,
            path: path.join(UI_SHOTS, `project-edit-${locale}-${theme}-${width}.png`),
          });
        }
      }
    }

    const compares = [
      { figma: "dashboard-overview.png", screen: "home", href: "/dashboard" },
      { figma: "dashboard-projects.png", screen: "projects", href: "/dashboard/projects" },
      { figma: "dashboard-add-project.png", screen: "project-edit", href: projectHref },
      { figma: "dashboard-users.png", screen: "users", href: "/dashboard/users" },
    ] as const;

    await setDashboardSurface(page, "ar", "light", 1440);
    for (const item of compares) {
      await page.goto(item.href);
      await waitReady(page);
      const ours = await page.screenshot({ type: "png" });
      const figmaPath = path.join(FIGMA, item.figma);
      if (!existsSync(figmaPath)) {
        continue;
      }
      const figma = readFileSync(figmaPath);
      await page.setContent(`<!doctype html><html><body style="margin:0;background:#111;display:flex">
        <img alt="figma" src="data:image/png;base64,${figma.toString("base64")}" style="width:50%;object-fit:contain;background:#fff">
        <img alt="ours" src="data:image/png;base64,${ours.toString("base64")}" style="width:50%;object-fit:contain;background:#fff">
      </body></html>`);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({ path: path.join(UI_SHOTS, `compare-${item.screen}-ar-1440.png`), fullPage: true });
    }
  });
});
