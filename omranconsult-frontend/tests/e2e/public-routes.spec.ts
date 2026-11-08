import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const LOCALES = [
  { locale: "en", dir: "ltr" },
  { locale: "ar", dir: "rtl" },
] as const;

const ROUTES = [
  "",
  "/about",
  "/services",
  "/projects",
  "/projects/cop16-technical-audit",
  "/contact",
] as const;

for (const { locale, dir } of LOCALES) {
  for (const route of ROUTES) {
    test(`${locale}${route || "/"} smoke + a11y`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(message.text());
        }
      });

      const response = await page.goto(`/${locale}${route}`);
      expect(response?.status()).toBe(200);

      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("h1")).toHaveCount(1);

      expect(consoleErrors).toEqual([]);

      const noHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth <= root.clientWidth;
      });
      expect(noHorizontalOverflow).toBe(true);

      // Let the section reveal (600 ms + stagger) finish so axe does not measure half-faded text.
      await page.waitForTimeout(1200);
      const axe = await new AxeBuilder({ page }).analyze();
      const severeViolations = axe.violations.filter((violation) =>
        ["critical", "serious"].includes(violation.impact ?? ""),
      );
      expect(severeViolations).toEqual([]);
    });
  }
}

test("arabic statistics keep suffix after the number", async ({ page }) => {
  await page.goto("/ar");
  const statsSection = page.locator('[data-section="stats"]');
  await expect(statsSection).toContainText("204+");
});

test("projects filters update URL", async ({ page }) => {
  await page.goto("/en/projects");
  await page.locator("summary", { hasText: "More filters" }).click();
  await page.selectOption('select[name="region"]', "riyadh");
  await page.getByRole("button", { name: "Apply" }).click();

  await expect(page).toHaveURL(/region=riyadh/);
  await expect(page.locator("h1")).toHaveCount(1);
});
