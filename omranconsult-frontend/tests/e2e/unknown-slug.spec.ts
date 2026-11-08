import { expect, test } from "@playwright/test";

test("unknown project and news slugs return HTTP 404", async ({ page }) => {
  const project = await page.goto("/ar/projects/does-not-exist");
  expect(project?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "العودة إلى الرئيسية" })).toBeVisible();

  const article = await page.goto("/ar/media/does-not-exist");
  expect(article?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "العودة إلى الرئيسية" })).toBeVisible();
});
