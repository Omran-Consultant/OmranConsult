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
  "/media",
  "/media/omran-cop16-technical-audit",
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

test.describe("390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  // The King Saud project's related cards carry a long English client name.
  const MOBILE_ROUTES = [...ROUTES, "/projects/king-saud-university-operation-and-maintenance-efficiency"];

  for (const { locale } of LOCALES) {
    for (const route of MOBILE_ROUTES) {
      test(`${locale}${route || "/"} has no horizontal scroll`, async ({ page }) => {
        await page.goto(`/${locale}${route}`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBe(0);
      });
    }
  }
});

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

test("the production CSP never allows 'unsafe-eval'", async ({ request }) => {
  // The suite runs against a production build; 'unsafe-eval' is a development-only allowance.
  for (const path of ["/en", "/ar/about", "/dashboard/login"]) {
    const response = await request.get(path);
    const policy = response.headers()["content-security-policy"];
    expect(policy, `${path} sends a CSP`).toBeTruthy();
    expect(policy, path).toContain("script-src 'self'");
    expect(policy, path).not.toContain("unsafe-eval");
  }
});
