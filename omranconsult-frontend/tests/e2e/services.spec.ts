import { expect, test } from "@playwright/test";

test("services renders the design and profile sections in order", async ({ page }) => {
  await page.goto("/ar/services");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["page-hero", "pillars", "asset-management", "engineering-and-design", "approach", "offerings", "tools", "cta"]);
  await expect(page.locator('[data-section="pillars"] > div > ol > li')).toHaveCount(3);
  await expect(page.locator('[data-section="asset-management"] ol li')).toHaveCount(10);
  await expect(page.locator('[data-section="engineering-and-design"] ol li')).toHaveCount(12);
  await expect(page.locator('[data-section="tools"] li')).toHaveCount(10);
});

test("english services keep the same structure", async ({ page }) => {
  await page.goto("/en/services");
  await expect(page.locator("h1")).toContainText("Integrated solutions");
  await expect(page.locator('[data-section="tools"] li')).toHaveCount(10);
});
