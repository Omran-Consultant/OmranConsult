import { expect, test } from "@playwright/test";

test("home renders the Figma sections in order", async ({ page }) => {
  await page.goto("/ar");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["hero", "stats", "about", "services", "projects", "coverage", "trust", "cta"]);
  await expect(page.locator('[data-section="hero"] h1')).toContainText("كفاءة");
  await expect(page.locator('[data-section="hero"]').getByRole("link", { name: "استكشف مشاريعنا" })).toHaveAttribute("href", "/ar/projects");
});

test("sector chips filter the featured projects without a reload", async ({ page }) => {
  await page.goto("/en");
  const projects = page.locator('[data-section="projects"]');
  const all = projects.getByRole("button", { name: "All", exact: true });
  await expect(all).toHaveAttribute("aria-pressed", "true");

  const universities = projects.getByRole("button", { name: "Universities" });
  await universities.click();
  await expect(universities).toHaveAttribute("aria-pressed", "true");
  await expect(all).toHaveAttribute("aria-pressed", "false");
  const visible = projects.locator('div.lg\\:flex a[href*="/projects/"]');
  await expect(visible).toHaveCount(2);
  await expect(visible.first()).toHaveAttribute("href", /university/);
  await expect(page).toHaveURL(/\/en$/);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("project carousel moves with the arrow keys (left is next in RTL)", async ({ page }) => {
    await page.goto("/ar");
    const track = page.getByRole("list", { name: "المشاريع المميزة" });
    await track.scrollIntoViewIfNeeded();
    await track.focus();
    const before = await track.evaluate((node) => node.scrollLeft);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => track.evaluate((node) => node.scrollLeft)).not.toBe(before);
    await expect(track.locator('li[aria-roledescription="slide"]')).toHaveCount(6);
  });
});

test("profile download button links to the API file", async ({ page }) => {
  await page.goto("/ar");
  const link = page.locator('[data-section="cta"]').getByRole("link", { name: "حمّل الملف التعريفي" });
  await expect(link).toHaveAttribute("href", /\/storage\/files\/omran-profile-2029\.pdf$/);
});
