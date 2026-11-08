import { expect, test } from "@playwright/test";

const locales = [
  { path: "/ar", title: "تعذّر تحميل الصفحة", retry: "إعادة المحاولة", hero: "كفاءة" },
  { path: "/en", title: "This page could not be loaded", retry: "Try again", hero: "efficiency" },
] as const;

test("localized error when the API is unreachable, and retry recovers", async ({ page }) => {
  await page.route("**/*", async (route) => {
    if (route.request().url().includes(":8000")) {
      await route.abort("connectionrefused");
      return;
    }
    await route.continue();
  });

  for (const locale of locales) {
    await page.context().addCookies([{ name: "x-omran-api", value: "down", domain: "127.0.0.1", path: "/" }]);
    await page.goto(locale.path);
    await expect(page.getByRole("heading", { name: locale.title })).toBeVisible();
    await expect(page.getByRole("button", { name: locale.retry })).toBeVisible();
    await expect(page.getByText("API unreachable")).toHaveCount(0);

    await page.context().clearCookies();
    await page.getByRole("button", { name: locale.retry }).click();
    await expect(page.locator('[data-section="hero"] h1')).toContainText(locale.hero);
  }
});
