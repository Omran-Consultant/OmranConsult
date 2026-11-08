import { expect, test } from "@playwright/test";

const ARTICLE = "/ar/media/omran-cop16-technical-audit";

test("media center shows the featured post, the grid and loads more", async ({ page }) => {
  await page.goto("/ar/media");
  await expect(page.locator("h1")).toHaveText("المركز الإعلامي");
  const tabs = page.getByRole("tablist", { name: "تصنيفات الأخبار" }).getByRole("tab");
  await expect(tabs).toHaveCount(5);
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");

  await expect(page.locator('[data-section="featured"] h2')).toContainText("COP16");
  const grid = page.locator('[data-section="grid"] ul > li');
  await expect(grid).toHaveCount(6);

  await page.getByRole("link", { name: "تحميل المزيد" }).click();
  await expect(page).toHaveURL(/\/ar\/media\?page=2$/);
  await expect(grid).toHaveCount(7);
  await expect(page.getByRole("link", { name: "تحميل المزيد" })).toHaveCount(0);
});

test("category tabs filter by link and by RTL arrow keys", async ({ page }) => {
  await page.goto("/ar/media");
  const tablist = page.getByRole("tablist", { name: "تصنيفات الأخبار" });

  await tablist.getByRole("tab", { name: "الفعاليات" }).click();
  await expect(page).toHaveURL(/category=events/);
  await expect(tablist.getByRole("tab", { name: "الفعاليات" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('[data-section="featured"]')).toHaveCount(0);
  await expect(page.locator('[data-section="grid"] ul > li')).toHaveCount(1);
  await expect(page.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "media-tab-events");

  await tablist.getByRole("tab", { name: "الفعاليات" }).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/category=articles/);
  await expect(tablist.getByRole("tab", { name: "مقالات" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(page).toHaveURL(/\/ar\/media$/);
});

test("article shows the head, body blocks, sidebar and share links", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(ARTICLE);
  await expect(page.locator("h1")).toContainText("COP16");
  await expect(page.getByRole("navigation", { name: "مسار التنقل" }).getByRole("link", { name: "المركز الإعلامي" })).toHaveAttribute("href", "/ar/media");
  await expect(page.locator("blockquote")).toContainText("نؤمن بأن جودة التنفيذ");
  await expect(page.getByRole("list", { name: "الوسوم" }).getByRole("listitem")).toHaveCount(4);

  const share = page.getByRole("link", { name: "مشاركة على X" });
  await expect(share).toHaveAttribute("href", /twitter\.com\/intent\/tweet\?url=http/);
  await expect(share).toHaveAttribute("rel", "noopener noreferrer");
  await page.getByRole("button", { name: "نسخ الرابط" }).click();
  await expect(page.getByText("تم نسخ الرابط")).toBeVisible();

  const related = page.locator("aside").getByRole("link").first();
  await expect(related).toHaveAttribute("href", /\/ar\/media\/[a-z0-9-]+$/);
  await expect(page.locator("aside").getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("href", "/ar/contact");
});

test("a post without body shows its summary only", async ({ page }) => {
  await page.goto("/en/media/osool-360-platform-launch");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('[data-section="body"] blockquote')).toHaveCount(0);
  await expect(page.locator('[data-section="body"] p').first()).not.toBeEmpty();
});

test("unknown article slug renders the not-found page", async ({ page }) => {
  await page.goto("/en/media/not-a-real-post");
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

test("media newsletter block subscribes", async ({ page }) => {
  await page.route("**/api/newsletter", async (route) => {
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "Subscribed." }) });
  });
  await page.goto("/en/media");
  const block = page.locator('[data-section="newsletter-wrap"]');
  await block.getByLabel("Email").fill("reader@example.com");
  await block.getByRole("button", { name: "Subscribe" }).click();
  await expect(block.getByText("Subscribed.")).toBeVisible();
});
