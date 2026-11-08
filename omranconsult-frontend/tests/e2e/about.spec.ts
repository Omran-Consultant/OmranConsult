import { expect, test } from "@playwright/test";

test("about renders the design and profile sections in order", async ({ page }) => {
  await page.goto("/ar/about");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual([
    "page-hero",
    "intro",
    "education-goals",
    "strategy",
    "governance",
    "work-stages",
    "experts",
    "org-chart",
    "trust",
    "partners",
    "clients",
    "cta",
  ]);
  await expect(page.locator("#credentials")).toHaveAttribute("data-section", "trust");
  await expect(page.locator('[data-section="clients"] img')).toHaveCount(30);
});

test("an expert card opens the bio dialog and Escape returns focus", async ({ page }) => {
  await page.goto("/en/about");
  const card = page.locator('[data-section="experts"] button[aria-haspopup="dialog"]').first();
  await card.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("experts show three cards until «عرض جميع الخبراء»", async ({ page }) => {
    await page.goto("/ar/about");
    const cards = page.locator('[data-section="experts"] li');
    await expect(cards.filter({ visible: true })).toHaveCount(3);
    const toggle = page.getByRole("button", { name: "عرض جميع الخبراء" });
    await toggle.click();
    await expect(page.getByRole("button", { name: "عرض أقل" })).toHaveAttribute("aria-expanded", "true");
    await expect(cards.filter({ visible: true })).toHaveCount(6);
  });
});
