import { expect, test, type Page } from "@playwright/test";

import { loginToDashboard, resetE2eSeed, setDashboardSurface, waitReady } from "./dashboard-helpers";

const DRAFT_PILL = "تعديلات غير منشورة";
const PUBLISHED_PILL = "منشور";

async function openBlock(page: Page, pageKey: string, section: string) {
  await page.goto("/dashboard/pages");
  await waitReady(page);
  const card = page.locator(`[data-page-card="${pageKey}"]`);
  if ((await card.getByRole("button", { expanded: true }).count()) === 0) {
    await card.locator("button[aria-expanded]").first().click();
  }
  await card.locator(`[data-block-link="${section}"]`).click();
  await page.waitForURL(/\/dashboard\/pages\/blocks\/\d+$/);
  await expect(page.locator("[data-block-tree]")).toBeVisible();
}

function publishCard(page: Page) {
  return page.locator("[data-publish-card]");
}

test.describe("dashboard site pages (5B-3a)", () => {
  test.describe.configure({ timeout: 240_000 });

  test.beforeAll(() => {
    resetE2eSeed();
  });

  test.afterAll(() => {
    resetE2eSeed();
  });

  test.beforeEach(async ({ page }) => {
    await loginToDashboard(page);
    await setDashboardSurface(page, "ar", "light", 1440);
  });

  test("lists the seven public pages with their sections, without the blocks edited elsewhere", async ({ page }) => {
    await page.goto("/dashboard/pages");
    await waitReady(page);
    await expect(page.locator("[data-page-card]")).toHaveCount(7);
    await expect(page.locator('[data-page-card="home"]')).toContainText("الصفحة الرئيسية");
    await expect(page.locator('[data-page-card="home"] [data-block-link="design_copy"]')).toContainText("نصوص الصفحة الرئيسية");
    await expect(page.locator('[data-page-card="home"] [data-block-link="design_copy"]')).not.toContainText("نصوص التصميم");
    await expect(page.locator('[data-page-card="home"] [data-block-link="tools"]')).toHaveCount(0);
    await expect(page.locator('[data-page-card="home"] [data-block-link="home_sectors"]')).toHaveCount(0);
    await page.locator('[data-page-card="about"] button[aria-expanded]').first().click();
    await expect(page.locator('[data-page-card="about"] [data-block-link]')).toHaveCount(1);
  });

  test("highlight controls only on accent fields, one hint per block, and a plain advanced disclosure", async ({ page }) => {
    await openBlock(page, "about", "design_copy");
    const fieldControls = (id: string) => page.locator(`label[for="${id}"]`).locator("xpath=../..").locator("[data-accent-highlight]");
    // The hero title is rendered with the accent colour on /about; the intro paragraph is not.
    await expect(fieldControls("block-hero-title-ar")).toHaveCount(1);
    await expect(fieldControls("block-hero-intro-ar")).toHaveCount(0);
    // List item titles never offer highlighting.
    const listItemControls = page.locator("[data-block-item] [data-accent-highlight]");
    await expect(listItemControls).toHaveCount(0);
    await expect(page.locator("[data-accent-hint]")).toHaveCount(1);
    await expect(page.locator("#block-hero-title-ar")).toHaveAttribute("aria-describedby", "block-accent-hint");
    await expect(page.locator("#block-hero-intro-ar")).not.toHaveAttribute("aria-describedby", /.+/);

    const advanced = page.locator("[data-block-advanced]").first();
    const summary = advanced.locator("summary");
    await expect(summary).toHaveText("إعدادات متقدمة");
    expect(await summary.evaluate((el) => getComputedStyle(el).display)).toBe("flex");
    expect(await summary.evaluate((el) => getComputedStyle(el).listStyleType)).toBe("none");
    const caret = summary.locator("svg");
    await expect(caret).toHaveCount(1);
    // Tailwind 4 `rotate-180` sets the `rotate` property, not `transform`.
    expect(await caret.evaluate((el) => getComputedStyle(el).rotate)).toBe("none");
    await summary.click();
    await expect(advanced).toHaveAttribute("open", "");
    await expect.poll(() => caret.evaluate((el) => getComputedStyle(el).rotate)).toBe("180deg");
  });

  test("an About title edit is a draft until published, then shows on the public page", async ({ page }) => {
    await openBlock(page, "about", "design_copy");
    const field = page.locator("#block-hero-title-ar");
    await expect(field).toBeVisible();
    // Markers must never appear in the editor; highlight is visual only.
    await expect(field).not.toContainText("{accent}");
    const original = await field.innerText();
    expect(original.length).toBeGreaterThan(0);

    await field.evaluate((el) => {
      el.innerHTML = 'عنوان <span data-accent="">تجريبي</span> للاختبار';
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    });
    await expect(field).not.toContainText("{accent}");
    await expect(field.locator("[data-accent]")).toHaveText("تجريبي");
    await publishCard(page).getByRole("button", { name: "حفظ المسودة" }).click();
    await expect(publishCard(page).getByText(DRAFT_PILL)).toBeVisible();

    // The live page keeps the published title while the draft exists.
    const live = await page.context().newPage();
    await live.goto("/ar/about");
    await expect(live.locator("h1")).not.toContainText("للاختبار");

    await publishCard(page).getByRole("button", { name: "نشر التعديلات" }).click();
    await expect(publishCard(page).getByText(PUBLISHED_PILL, { exact: true })).toBeVisible();
    await expect.poll(async () => {
      await live.reload();
      return live.locator("h1").innerText();
    }).toContain("تجريبي للاختبار");
    // The accent markers colour the word; they never show as text.
    await expect(live.locator("h1")).not.toContainText("{accent}");

    await field.evaluate((el, text) => {
      el.textContent = text;
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    }, original);
    await publishCard(page).getByRole("button", { name: "نشر التعديلات" }).click();
    await expect(publishCard(page).getByText(PUBLISHED_PILL, { exact: true })).toBeVisible();
    await expect.poll(async () => {
      await live.reload();
      return live.locator("h1").innerText();
    }).not.toContain("للاختبار");
    await live.close();
  });

  test("text missing in one language blocks publishing, and discarding restores the live text", async ({ page }) => {
    await openBlock(page, "contact", "design_copy");
    await page.getByRole("tab", { name: /English/ }).click();
    const english = page.locator("#block-title-en");
    const original = await english.innerText();
    await english.evaluate((el) => {
      el.textContent = "";
      el.dispatchEvent(new InputEvent("input", { bubbles: true }));
    });
    await publishCard(page).getByRole("button", { name: "حفظ المسودة" }).click();

    await expect(page.locator("[data-publish-blockers] li")).toHaveText(["النص ناقص في إحدى اللغتين: العنوان"]);
    await expect(publishCard(page).getByRole("button", { name: "نشر التعديلات" })).toBeDisabled();
    await expect(page.getByRole("tab", { name: /English/ })).toContainText(/\d+ من \d+/);

    await publishCard(page).getByRole("button", { name: "تجاهل التعديلات" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "تجاهل التعديلات" }).click();
    await expect(english).toHaveText(original);
    await expect(page.locator("[data-publish-blockers]")).toHaveCount(0);
  });

  test("list items can be added, moved and removed in a profile block", async ({ page }) => {
    await openBlock(page, "home", "work_stages");
    const stages = page.locator('[data-block-list="stages"] > ol > li');
    await expect(stages).toHaveCount(3);
    const firstTitle = await page.locator("#block-stages-0-title-ar").innerText();

    await stages.nth(0).getByRole("button", { name: "تحريك لأسفل" }).first().click();
    await expect(page.locator("#block-stages-1-title-ar")).toHaveText(firstTitle);

    await page.locator('[data-block-list="stages"]').getByRole("button", { name: "إضافة عنصر" }).last().click();
    await expect(stages).toHaveCount(4);
    await expect(page.locator("#block-stages-3-title-ar")).toHaveText("");
    await stages.nth(3).getByRole("button", { name: "حذف العنصر" }).first().click();
    await expect(stages).toHaveCount(3);
    await expect(publishCard(page).getByText("لديك تعديلات لم تُحفظ بعد.")).toBeVisible();
  });

  test("a hero slide is edited in the drawer as a draft and can be discarded", async ({ page }) => {
    await page.goto("/dashboard/pages?tab=slides");
    await waitReady(page);
    await expect(page.locator("[data-dashboard-row]")).toHaveCount(14);
    await page.locator("[data-dashboard-row]", { hasText: "الرؤية" }).click();
    const editor = page.locator('[data-slide-editor="vision"]');
    const headline = editor.locator("#slide-headline-ar");
    const original = await headline.inputValue();

    await headline.fill("رؤية للاختبار");
    await editor.getByRole("button", { name: "حفظ المسودة" }).click();
    await expect(editor.getByText(DRAFT_PILL)).toBeVisible();
    await expect(page.locator("[data-dashboard-row]", { hasText: "الرؤية" }).getByText(DRAFT_PILL)).toBeVisible();

    await editor.getByRole("button", { name: "تجاهل التعديلات" }).click();
    await page.getByRole("dialog").last().getByRole("button", { name: "تجاهل التعديلات" }).click();
    await expect(headline).toHaveValue(original);
  });

  test("a statistic previews its formatted value and saves a draft", async ({ page }) => {
    await page.goto("/dashboard/pages?tab=statistics");
    await waitReady(page);
    await expect(page.locator("[data-dashboard-row]")).toHaveCount(7);
    await page.locator("[data-dashboard-row]", { hasText: "حجم المشاريع" }).click();
    const editor = page.locator('[data-statistic-editor="project_volume"]');
    await expect(editor.locator("[data-statistic-preview]")).toHaveText("15B+");

    await editor.locator("#statistic-value").fill("16.5");
    await expect(editor.locator("[data-statistic-preview]")).toHaveText("16.50B+");
    await editor.locator("#statistic-value").fill("abc");
    await expect(editor.getByRole("button", { name: "حفظ المسودة" })).toBeDisabled();
    await editor.locator("#statistic-value").fill("16");
    await editor.getByRole("button", { name: "حفظ المسودة" }).click();
    await expect(editor.getByText(DRAFT_PILL)).toBeVisible();

    await editor.getByRole("button", { name: "تجاهل التعديلات" }).click();
    await page.getByRole("dialog").last().getByRole("button", { name: "تجاهل التعديلات" }).click();
    await expect(editor.locator("#statistic-value")).toHaveValue("15");
  });

  test("the Home sectors order is picked, published and shown on the public home page", async ({ page }) => {
    await page.goto("/dashboard/pages?tab=sectors");
    await waitReady(page);
    const selected = page.locator("[data-home-sectors-selected] > li");
    await expect(selected).toHaveCount(5);
    const defaults = await selected.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-home-sector")));
    expect(defaults).toEqual(["education", "health", "water-and-environment", "infrastructure", "universities"]);
    await expect(page.locator("[data-home-sectors-available] button").first()).toBeDisabled();

    // Universities first, by keyboard: focus its handle, lift, move up four places, drop.
    const handle = page.locator('[data-home-sector="universities"] button').first();
    await handle.focus();
    // dnd-kit announces each step in its live region; waiting for it keeps the key presses in step.
    const announcer = page.locator('[id^="DndLiveRegion"]');
    await page.keyboard.press("Space");
    await expect(handle).toHaveAttribute("aria-pressed", "true");
    // The sensor measures the list right after pick-up and ignores an arrow key until it has.
    await expect(async () => {
      await page.keyboard.press("ArrowUp");
      await expect(announcer).toContainText("was moved over droppable area infrastructure", { timeout: 1_000 });
    }).toPass();
    for (const over of ["water-and-environment", "health", "education"]) {
      await page.keyboard.press("ArrowUp");
      await expect(announcer).toContainText(`was moved over droppable area ${over}`);
    }
    await page.keyboard.press("Space");
    await expect(selected.first()).toHaveAttribute("data-home-sector", "universities");

    await page.locator('[data-home-sector="infrastructure"]').getByRole("button", { name: /إزالة/ }).click();
    await expect(selected).toHaveCount(4);
    await page.getByRole("button", { name: "نشر الترتيب" }).click();
    await expect(page.getByText("تم نشر الترتيب")).toBeVisible();

    const live = await page.context().newPage();
    await live.setViewportSize({ width: 1440, height: 900 });
    await expect.poll(async () => {
      await live.goto("/en");
      return live.locator('[data-section="projects"] button[aria-pressed]').allInnerTexts();
    }).toEqual(["All", "Universities", "Education", "Health", "Water and Environment"]);
    await live.close();
  });
});
