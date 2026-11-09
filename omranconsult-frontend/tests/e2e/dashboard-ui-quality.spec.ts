import { expect, test } from "@playwright/test";

import { loginToDashboard, setDashboardSurface, SURFACE_WIDTHS, waitReady } from "./dashboard-helpers";

const SCREENS = ["/dashboard", "/dashboard/projects", "/dashboard/users"] as const;

test.describe("dashboard UI quality", () => {
  test.beforeEach(async ({ page }) => {
    await loginToDashboard(page);
  });

  for (const width of SURFACE_WIDTHS) {
    test(`toolbar control heights at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
      for (const href of SCREENS) {
        await page.goto(href);
        await waitReady(page);
        const toolbar = page.locator("[data-dashboard-toolbar]").first();
        if ((await toolbar.count()) === 0) {
          continue;
        }
        const heights = await toolbar.locator("button, input").evaluateAll((nodes) =>
          nodes.map((node) => Math.round(node.getBoundingClientRect().height)),
        );
        const filtered = heights.filter((height) => height > 0);
        if (filtered.length < 2) {
          continue;
        }
        const baseline = filtered[0];
        for (const height of filtered) {
          expect(Math.abs(height - baseline)).toBeLessThanOrEqual(1);
        }
      }
    });
  }

  test("topbar search matches icon button height", async ({ page }) => {
    await setDashboardSurface(page, "ar", "light", 1440);
    await page.goto("/dashboard");
    await waitReady(page);
    const search = page.locator("[data-dashboard-search]");
    const iconButton = page.locator("header[data-dashboard-toolbar] button").nth(1);
    const searchHeight = await search.evaluate((node) => Math.round(node.getBoundingClientRect().height));
    const iconHeight = await iconButton.evaluate((node) => Math.round(node.getBoundingClientRect().height));
    expect(Math.abs(searchHeight - iconHeight)).toBeLessThanOrEqual(1);
  });
});
