import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/ar");
    const toggle = page.getByRole("button", { name: "فتح القائمة" });
    await toggle.click();

    const dialog = page.getByRole("dialog", { name: "القائمة" });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "إغلاق القائمة" })).toBeFocused();
    await expect(dialog.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");

    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("open menu has no serious axe violations", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(500);
    const axe = await new AxeBuilder({ page }).include("#mobile-menu").analyze();
    expect(axe.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""))).toEqual([]);
  });
});

test("desktop header marks the active link and links to contact", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/en/about");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("header").getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/en/contact");
});

test("language switch keeps the path", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/en/services");
  await page.locator("header").getByRole("link", { name: "ع" }).click();
  await expect(page).toHaveURL(/\/ar\/services$/);
});

test("light is the default and the theme toggle persists dark mode", { tag: "@desktop" }, async ({ page }) => {
  const initialResponse = await page.request.get("/en");
  expect(await initialResponse.text()).not.toMatch(/<html[^>]*class="[^"]*\bdark\b/);

  await page.goto("/en");
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
});

for (const locale of ["en", "ar"] as const) {
  test(`${locale} unknown path renders the localized 404`, async ({ page }) => {
    const response = await page.goto(`/${locale}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText(locale === "ar" ? "الصفحة غير موجودة" : "Page not found");
    await expect(page.getByRole("link", { name: locale === "ar" ? "العودة إلى الرئيسية" : "Back to home" })).toBeVisible();
  });
}

test("footer newsletter validates the email before sending", async ({ page }) => {
  await page.goto("/en");
  const footer = page.locator("footer");
  await footer.getByLabel("Email").fill("not-an-email");
  await footer.getByRole("button", { name: "Subscribe" }).click();
  await expect(footer.getByText("Enter a valid email address")).toBeVisible();
  await expect(footer.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
});
