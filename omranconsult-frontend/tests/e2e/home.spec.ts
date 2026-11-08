import { expect, test } from "@playwright/test";

test("home renders the Figma sections in order", async ({ page }) => {
  await page.goto("/ar");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["hero", "stats", "about", "services", "projects", "coverage", "trust", "cta"]);
  await expect(page.locator('[data-section="hero"] h1')).toContainText("كفاءة");
  await expect(page.locator('[data-section="trust"] [data-credential-scan]')).toHaveCount(8);
  await expect(page.locator('[data-section="trust"]').getByText("منتهية")).toHaveCount(0);
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

for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
  test.describe(`laptop ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("hero stats bar is above the fold in Arabic", async ({ page }) => {
      await page.goto("/ar");
      const stats = page.locator('[data-section="hero"] dl');
      await expect(stats).toBeVisible();
      const box = await stats.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
    });
  });
}

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

test("home trust shows the partner cards under one partners label", async ({ page }) => {
  await page.goto("/ar");
  const trust = page.locator('[data-section="trust"]');
  await expect(trust.getByRole("heading", { name: "شركاؤنا", exact: true })).toHaveCount(1);
  const partners = trust.getByRole("list", { name: "شركاؤنا" });
  await expect(partners.getByRole("img", { name: "OLIVER WYMAN — A MARSH BUSINESS" })).toHaveCount(1);
  await expect(partners.getByRole("img", { name: "MUSANADAH" })).toHaveCount(1);
  await expect(partners.getByRole("img", { name: "TACENT" })).toHaveCount(1);
  await expect(partners.getByRole("img", { name: "BUREAU VERITAS" })).toHaveCount(1);
  await expect(partners.getByRole("heading", { name: "BUREAU VERITAS", exact: true })).toBeVisible();
  await expect(partners.getByText("في مجال الجودة والامتثال وإدارة المخاطر")).toBeVisible();

  await page.goto("/en");
  const english = page.locator('[data-section="trust"]');
  await expect(english.getByRole("heading", { name: "Our partners", exact: true })).toHaveCount(1);
  await expect(english.getByRole("list", { name: "Our partners" }).getByText("Quality, compliance, and risk management")).toBeVisible();
});

test("home does not show the expired-certificate badge", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator('[data-section="trust"]').getByText("Expired")).toHaveCount(0);
});

test("profile download button links to the API file", async ({ page }) => {
  await page.goto("/ar");
  const link = page.locator('[data-section="cta"]').getByRole("link", { name: "حمّل الملف التعريفي" });
  await expect(link).toHaveAttribute("href", /\/storage\/files\/omran-profile-2029\.pdf$/);
});
