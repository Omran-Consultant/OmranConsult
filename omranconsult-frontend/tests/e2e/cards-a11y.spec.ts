import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Dark-theme axe for every public page (SITE_POLISH: axe light + real dark). Light is covered by public-routes.
 * Kept to one viewport so the public-read limit (120/min) still has room.
 */
const LOCALES = ["ar", "en"] as const;
const ROUTES = ["", "/about", "/services", "/projects", "/projects/cop16-technical-audit", "/contact", "/media", "/media/omran-cop16-technical-audit"] as const;

test.describe("dark 1440", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      test(`${locale}${route || "/"} has no serious axe issue`, async ({ page }) => {
        await page.addInitScript(() => {
          localStorage.setItem("oc-theme", "dark");
        });
        const response = await page.goto(`/${locale}${route}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveClass(/\bdark\b/);
        await page.waitForTimeout(1200);
        const axe = await new AxeBuilder({ page }).analyze();
        const severe = axe.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
        expect(severe).toEqual([]);
      });
    }
  }
});
