import { expect, test } from "@playwright/test";

test("project cards with owner logos render images", async ({ page }) => {
  await page.goto("/en/projects");

  const cardsWithLogos = page.locator('[data-owner-has-logo="true"]');
  const count = await cardsWithLogos.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const card = cardsWithLogos.nth(index);
    await expect(card.locator("img")).toBeVisible();
  }
});
