import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { ensureDashboardTheme, loginToDashboard, setDashboardSurface, waitReady } from "./dashboard-helpers";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "demo-projects");
const SLUG = "western-region-education-projects-study";

test("the dashboard marks a seeded project as demo, and the public page does not", async ({ page }) => {
  test.setTimeout(240_000);
  mkdirSync(SHOTS, { recursive: true });
  await loginToDashboard(page);

  for (const locale of ["ar", "en"] as const) {
    const label = locale === "ar" ? "يحتوي محتوى تجريبي" : "Contains demo content";

    for (const width of [1440, 390]) {
      await setDashboardSurface(page, locale, "light", width);
      await page.goto("/dashboard/projects");
      await waitReady(page);
      await ensureDashboardTheme(page, "light");
      const badges = page.locator("[data-demo-badge]").filter({ visible: true });
      await expect(badges).toHaveCount(1);
      await expect(badges).toHaveText(label);
      await page.screenshot({ path: path.join(SHOTS, `dashboard-list-${locale}-${width}-light.png`), fullPage: true });
    }

    await setDashboardSurface(page, locale, "light", 1440);
    await page.goto("/dashboard/projects");
    await waitReady(page);
    const href = await page.locator(`a[data-slug="${SLUG}"]`).first().getAttribute("href");
    await page.goto(href ?? "/dashboard/projects");
    await waitReady(page);
    await expect(page.locator("[data-demo-badge]")).toHaveText(label);
    await page.screenshot({ path: path.join(SHOTS, `dashboard-editor-${locale}-1440-light.png`) });
  }

  await page.goto(`/en/projects/${SLUG}`);
  await expect(page.getByText("Contains demo content")).toHaveCount(0);
  await expect(page.locator("[data-demo-badge]")).toHaveCount(0);
});
