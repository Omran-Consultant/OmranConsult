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

test("credentials show every certificate and license scan", async ({ page }) => {
  await page.goto("/ar/about#credentials");
  const section = page.locator("#credentials");
  await expect(section.locator("[data-credential-scan]")).toHaveCount(13);
  await expect(section.getByText("منتهية")).toHaveCount(0);
  const card = section.getByRole("button", { name: "عرض ISO 9001" });
  await card.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const scan = dialog.locator("img");
  await expect(scan).toBeVisible();
  const width = await scan.evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(411);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(card).toBeFocused();

  await page.goto("/en/about#credentials");
  await expect(page.locator("#credentials [data-credential-scan]")).toHaveCount(13);
  await expect(page.locator("#credentials").getByText("Expired")).toHaveCount(0);
});

test("about names the partners once", async ({ page }) => {
  await page.goto("/ar/about#partners");
  await expect(page.locator("#credentials").getByRole("heading", { name: "شركاؤنا" })).toHaveCount(0);
  await expect(page.locator("#partners").getByRole("heading", { name: "شركاؤنا", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "شراكات نوعية", exact: true })).toHaveCount(0);

  await page.goto("/en/about#partners");
  await expect(page.locator("#credentials").getByRole("heading", { name: "Our partners" })).toHaveCount(0);
  await expect(page.locator("#partners").getByRole("heading", { name: "Our partners", exact: true })).toBeVisible();
});

test("strategy cards share one height and each shows an icon", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ar/about#strategy");
  const cards = page.locator('[data-section="strategy"] li');
  await expect(cards).toHaveCount(3);
  await expect(cards.locator("svg")).toHaveCount(3);
  const heights = await cards.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
});

test("expert specialty filter keeps one matching card", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/about#experts");
  const section = page.locator('[data-section="experts"]');
  await section.getByRole("button", { name: "Quality Management" }).click();
  const cards = section.locator("li").filter({ visible: true });
  await expect(cards).toHaveCount(1);
  await expect(cards.getByRole("button", { name: /Waseem Asfahan/ })).toBeVisible();
});

test("an expert card opens the bio dialog and Escape returns focus", async ({ page }) => {
  await page.goto("/en/about");
  const card = page.locator('[data-section="experts"] button[aria-haspopup="dialog"]').filter({ visible: true }).first();
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

  test("expert carousel moves with the arrow keys (left is next in RTL)", async ({ page }) => {
    await page.goto("/ar/about");
    const track = page.getByRole("list", { name: "الخبراء" });
    await track.scrollIntoViewIfNeeded();
    await track.focus();
    const before = await track.evaluate((node) => node.scrollLeft);
    await page.keyboard.press("ArrowLeft");
    await expect.poll(() => track.evaluate((node) => node.scrollLeft)).not.toBe(before);
    await expect(track.locator('li[aria-roledescription="slide"]')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  });
});
