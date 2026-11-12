import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const DETAIL = "/ar/projects/king-saud-university-operation-and-maintenance-efficiency";
/** Full and single-gallery fixtures exist only in the E2E database (`e2e:prepare-database`). */
const RICH_DETAIL = "/ar/projects/courts-of-appeal-design-and-supervision-phase-two";
const ONE_IMAGE_DETAIL = "/ar/projects/sports-facilities-efficiency-and-development";
const POOR_DETAIL = "/ar/projects/dams-operation-and-maintenance-efficiency-consulting";

test("projects renders the design sections in order", async ({ page }) => {
  await page.goto("/ar/projects");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["page-hero", "filter-bar", "grid", "clients"]);
  await expect(page.locator("h1")).toHaveText("مشاريعنا");
  await expect(page.locator('[data-section="filter-bar"] li a')).toHaveCount(9);
  await expect(page.locator('[data-section="grid"] ul').first().locator("li")).toHaveCount(9);
});

test("every client tile on Projects shows a logo or a name", async ({ page }) => {
  await page.goto("/ar/projects");
  const tiles = page.locator('[data-section="clients"] li');
  await expect(tiles).toHaveCount(30);
  const blank = await tiles.evaluateAll((items) =>
    items.filter((item) => !item.textContent?.trim() && !item.querySelector("img[alt]:not([alt=''])")).length,
  );
  expect(blank).toBe(0);
});

test("a sector chip filters through the URL", async ({ page }) => {
  await page.goto("/ar/projects");
  await page.locator('[data-section="filter-bar"]').getByRole("link", { name: "الصحة" }).click();
  await expect(page).toHaveURL(/sector=health/);
  await expect(page.locator('[data-section="filter-bar"] a[aria-current="true"]')).toHaveText("الصحة");
  await expect(page.locator('[data-section="grid"] ul').first().locator("li")).toHaveCount(3);
});

test("search is debounced into ?q= and the empty state clears it", async ({ page }) => {
  await page.goto("/ar/projects");
  // The debounce is React's; before hydration the field is a plain GET form.
  await expect(page.locator('form[role="search"][data-hydrated]')).toBeAttached();
  await page.getByRole("searchbox", { name: "ابحث عن مشروع" }).fill("جامعة");
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator('[data-section="grid"] ul').first().locator("li")).toHaveCount(2);

  await page.getByRole("searchbox", { name: "ابحث عن مشروع" }).fill("لا يوجد مشروع بهذا الاسم");
  await expect(page.getByText("لا توجد مشاريع مطابقة للبحث")).toBeVisible();
  await page.getByRole("link", { name: "مسح الفلاتر" }).click();
  await expect(page).toHaveURL(/\/ar\/projects$/);
  await expect(page.getByRole("searchbox", { name: "ابحث عن مشروع" })).toHaveValue("");
});

test("pagination moves to the next page on desktop", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/ar/projects");
  await page.getByRole("link", { name: "الصفحة التالية" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByRole("link", { name: "الصفحة 2" })).toHaveAttribute("aria-current", "page");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("«عرض المزيد» appends the next page", async ({ page }) => {
    await page.goto("/ar/projects");
    const list = page.locator('[data-section="grid"] ul').nth(1);
    await expect(list.locator("li")).toHaveCount(9);
    await page.getByRole("link", { name: "عرض المزيد" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(list.locator("li")).toHaveCount(18);
  });
});

test("project details hide empty facts and keep the edge-case overview", async ({ page }) => {
  await page.goto(DETAIL);
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["hero", "facts-bar", "body", "related"]);
  await expect(page.locator('[data-section="facts-bar"] dt')).toHaveText(["العميل", "القطاع"]);
  await expect(page.getByRole("link", { name: "مشاريع أخرى للجهة نفسها" })).toHaveAttribute("href", /client=bin-jarallah-group-contracting/);
  await expect(page.locator('[data-section="related"] li')).toHaveCount(3);
});

test("project inquiry validates and posts source=project", async ({ page }) => {
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/inquiries", async (route) => {
    body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "استلمنا طلبك" }) });
  });
  await page.goto(DETAIL);
  const card = page.locator('[data-section="body"] aside');

  await card.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(card.getByText("أدخل اسمك")).toBeVisible();
  await expect(card.getByText("أدخل بريداً إلكترونياً صحيحاً")).toBeVisible();

  await card.getByLabel("الاسم الكامل").fill("مهندس تجربة");
  await card.getByLabel("البريد الإلكتروني").fill("test@example.com");
  await card.getByRole("button", { name: "إرسال الطلب" }).click();
  await expect(card.getByRole("status")).toContainText("استلمنا طلبك");
  expect(body).toEqual({
    source: "project",
    project_slug: "king-saud-university-operation-and-maintenance-efficiency",
    name: "مهندس تجربة",
    email: "test@example.com",
    website: "",
  });
});

test("project inquiry sends only one request on a double submit", async ({ page }) => {
  let calls = 0;
  let release: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/inquiries", async (route) => {
    calls += 1;
    await gate;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "Received" }) });
  });
  await page.goto("/en/projects/king-saud-university-operation-and-maintenance-efficiency");
  const card = page.locator('[data-section="body"] aside');
  await card.getByLabel("Full name").fill("Test engineer");
  await card.getByLabel("Email").fill("test@example.com");
  await card.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });

  await expect.poll(() => calls).toBe(1);
  release?.();
  await expect(card.getByRole("status")).toBeVisible();
});

for (const viewport of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }]) {
  test.describe(`laptop ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });

    test("project title stays above the fold", async ({ page }) => {
      for (const path of [DETAIL, "/en/projects/king-saud-university-operation-and-maintenance-efficiency"]) {
        await page.goto(path);
        const title = page.locator('[data-section="hero"] h1');
        await expect(title).toBeVisible();
        const box = await title.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height);
      }
    });
  });
}

test("unknown project slug renders the not-found page", async ({ page }) => {
  await page.goto("/en/projects/not-a-real-project");
  await expect(page.getByRole("link", { name: "Back to home" })).toBeVisible();
});

async function cardSizes(page: Page, selector: string) {
  await expect(page.locator(selector).first()).toBeVisible();
  return page.locator(selector).evaluateAll((cards) =>
    cards.map((card) => {
      const { width, height } = card.getBoundingClientRect();
      return [Math.round(width), Math.round(height)];
    }),
  );
}

function expectCards(sizes: number[][], expected: readonly (readonly [number, number])[]) {
  expect(sizes.length).toBeGreaterThanOrEqual(expected.length);
  expected.forEach(([width, height], index) => {
    expect(Math.abs((sizes[index]?.[0] ?? 0) - width), `card ${index} width`).toBeLessThanOrEqual(4);
    expect(Math.abs((sizes[index]?.[1] ?? 0) - height), `card ${index} height`).toBeLessThanOrEqual(4);
  });
}

// Desktop layout sizes only — phone projects set isMobile and skip @desktop.
test.describe("Figma card sizes at 1440", { tag: "@desktop" }, () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("home bento", async ({ page }) => {
    await page.goto("/ar");
    expectCards(await cardSizes(page, '[data-section="projects"] .lg\\:flex a[href*="/projects/"]'), [
      [740, 640],
      [516, 308],
      [516, 308],
      [411, 460],
      [411, 460],
      [411, 460],
    ]);
  });

  test("projects grid and related", async ({ page }) => {
    await page.goto("/ar/projects");
    expectCards(await cardSizes(page, '[data-section="grid"] ul:first-of-type a[href*="/projects/"]'), [[411, 480]]);
    await page.goto(DETAIL);
    expectCards(await cardSizes(page, '[data-section="related"] li a'), [[411, 440]]);
  });
});

test.describe("Figma card sizes at 390", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("home carousel and projects list", async ({ page }) => {
    await page.goto("/ar");
    expectCards(await cardSizes(page, '[data-section="projects"] [aria-roledescription="slide"] a'), [[300, 420]]);
    await page.goto("/ar/projects");
    expectCards(await cardSizes(page, '[data-section="grid"] ul:nth-of-type(2) a[href*="/projects/"]'), [[350, 400]]);
  });
});

test.describe("project detail layout", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  async function factWidths(page: Page) {
    return page.locator('[data-section="facts-bar"] dl > div').evaluateAll((cells) => cells.map((cell) => Math.round(cell.getBoundingClientRect().width)));
  }

  test("a full project shows all sections, and facts share the bar evenly", async ({ page }) => {
    await page.goto(RICH_DETAIL);
    await expect(page.locator('[data-section="facts-bar"] dt')).toHaveText(["العميل", "الموقع", "نوع الخدمة", "القطاع", "الحالة"]);
    const widths = await factWidths(page);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(2);

    const body = page.locator('[data-section="body"]');
    await expect(body.getByRole("heading", { name: "أهداف المشروع" })).toBeVisible();
    await expect(body.locator("ul:not([data-section-part]) li")).toHaveCount(2);
    await expect(body.locator("blockquote")).toHaveText("اقتباس تجريبي");
    await expect(body.locator('[data-section-part="scope"] li span:first-child')).toHaveText(["01", "02", "03", "04"]);
    await expect(body.locator('[data-section-part="gallery"] button')).toHaveCount(3);
    await expect(body.getByRole("link", { name: "مشاريع أخرى للجهة نفسها" })).toBeVisible();
    await expect(body.locator('[data-section-part="owner"]')).toHaveCount(0);
  });

  test("the inquiry card stays in view while the content scrolls", async ({ page }) => {
    await page.goto(RICH_DETAIL);
    const aside = page.locator('[data-section="body"] aside');
    await expect(aside).toHaveCSS("position", "sticky");
    await page.locator('[data-section-part="gallery"]').scrollIntoViewIfNeeded();
    const top = await aside.evaluate((node) => node.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(116);
    expect(top).toBeLessThan(200);
  });

  test("the gallery lightbox opens, follows RTL arrows, closes and returns focus", async ({ page }) => {
    await page.goto(RICH_DETAIL);
    const first = page.locator('[data-section-part="gallery"] button').first();
    await first.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("1 / 3")).toBeVisible();
    await expect(dialog.getByRole("button", { name: "إغلاق معرض الصور" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(dialog.getByText("2 / 3")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText("1 / 3")).toBeVisible();
    await dialog.getByRole("button", { name: "الصورة التالية" }).click();
    await expect(dialog.getByText("2 / 3")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });

  test("one gallery image fills the column", async ({ page }) => {
    await page.goto(ONE_IMAGE_DETAIL);
    const images = page.locator('[data-section-part="gallery"] button');
    await expect(images).toHaveCount(1);
    expect(Math.round((await images.boundingBox())?.width ?? 0)).toBeGreaterThanOrEqual(796);
  });

  test("a project with no optional data has no empty frames", async ({ page }) => {
    await page.goto(POOR_DETAIL);
    await expect(page.locator('[data-section="facts-bar"] dt')).toHaveText(["العميل", "القطاع"]);
    const widths = await factWidths(page);
    expect(Math.abs((widths[0] ?? 0) - (widths[1] ?? 0))).toBeLessThanOrEqual(2);
    await expect(page.locator('[data-section-part="scope"]')).toHaveCount(0);
    await expect(page.locator('[data-section-part="gallery"]')).toHaveCount(0);
    const owner = page.locator('[data-section-part="owner"]');
    await expect(owner.getByRole("link", { name: "مشاريع أخرى للجهة نفسها" })).toBeVisible();
    await expect(page.locator('[data-section="related"] li').first()).toBeVisible();
  });
});

test("on mobile the inquiry form follows the project content", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(RICH_DETAIL);
  const galleryBottom = await page.locator('[data-section-part="gallery"]').evaluate((node) => node.getBoundingClientRect().bottom);
  const asideTop = await page.locator('[data-section="body"] aside').evaluate((node) => node.getBoundingClientRect().top);
  expect(asideTop).toBeGreaterThanOrEqual(galleryBottom);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test.describe("filter bar keeps search and filters on the first chip row", { tag: "@desktop" }, () => {
  for (const width of [1440, 1024]) {
    for (const locale of ["ar", "en"]) {
      test(`${locale} at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}/projects`);
        const bar = page.locator('[data-section="filter-bar"]');
        await expect(bar.getByRole("search")).toBeVisible();
        // One evaluate, so a scroll between measurements cannot skew the comparison.
        const tops = await bar.evaluate((section) =>
          ["li a", '[role="search"]', "summary"].map((selector) => section.querySelector(selector)?.getBoundingClientRect().top ?? Number.NaN),
        );
        const [chip, search, filter] = tops;
        expect(Math.abs((search ?? Number.NaN) - (chip ?? 0))).toBeLessThanOrEqual(1);
        expect(Math.abs((filter ?? Number.NaN) - (chip ?? 0))).toBeLessThanOrEqual(1);
      });
    }
  }
});

test.describe("filter panel listbox", () => {
  async function openPanel(page: Page, locale: "ar" | "en") {
    await page.goto(`/${locale}/projects`);
    await page.locator('[data-section="filter-bar"] summary').click();
    const name = locale === "ar" ? "الجهة المالكة" : "Owning entity";
    const combobox = page.getByRole("combobox", { name });
    await expect(combobox).toBeVisible();
    return combobox;
  }

  test("keyboard: arrows, Enter, Escape and type-ahead, then the form submits the value", async ({ page }) => {
    const combobox = await openPanel(page, "ar");
    await expect(combobox).toHaveText("كل الجهات");
    const box = await combobox.boundingBox();
    // 48 px on desktop and tablet, 44 px at 767 px and below.
    const narrow = (page.viewportSize()?.width ?? 1280) <= 767;
    expect(box?.height).toBe(narrow ? 44 : 48);
    // The label must not be clipped vertically.
    const text = await combobox.locator("span").first().boundingBox();
    expect(text && box && text.y >= box.y && text.y + text.height <= box.y + box.height).toBe(true);

    await combobox.focus();
    await page.keyboard.press("ArrowDown");
    await expect(combobox).toHaveAttribute("aria-expanded", "true");
    const listbox = page.getByRole("listbox", { name: "الجهة المالكة" });
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole("option", { selected: true })).toHaveText("كل الجهات");
    await page.keyboard.press("Escape");
    await expect(combobox).toHaveAttribute("aria-expanded", "false");
    await expect(combobox).toHaveText("كل الجهات");

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const second = await listbox.getByRole("option").nth(1).textContent();
    await expect(combobox).toHaveAttribute("aria-activedescendant", "projects-client-option-1");
    await page.keyboard.press("Enter");
    await expect(combobox).toHaveAttribute("aria-expanded", "false");
    await expect(combobox).toHaveText(second ?? "");
    await expect(combobox).toBeFocused();

    // Type-ahead moves to the first option that starts with the typed text.
    // Hidden options are not in the accessibility tree, so read the closed list by its markup.
    const labels = await page.locator('#projects-client ~ [role="listbox"] [role="option"]').allTextContents();
    const letter = (labels[3] ?? "").charAt(0);
    const target = labels.find((label, index) => index > 1 && label.startsWith(letter));
    // Playwright has no Arabic key map; an Arabic keyboard sends this keydown.
    await combobox.dispatchEvent("keydown", { key: letter, bubbles: true });
    await expect(combobox).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Enter");
    await expect(combobox).toHaveText(target ?? "");

    await page.getByRole("button", { name: "تطبيق" }).click();
    await expect(page).toHaveURL(/client=/);
    await page.locator('[data-section="filter-bar"] summary').click();
    await expect(page.getByRole("combobox", { name: "الجهة المالكة" })).toHaveText(target ?? "");
  });

  test("mouse picks an option and the list stays inside the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const combobox = await openPanel(page, "en");
    await expect(combobox).toHaveText("All entities");
    await combobox.click();
    const listbox = page.getByRole("listbox", { name: "Owning entity" });
    const box = await listbox.boundingBox();
    expect(box && box.x >= 0 && box.x + box.width <= 390).toBe(true);
    expect(box?.height).toBeLessThanOrEqual(320);
    await listbox.getByRole("option").nth(2).click();
    await expect(listbox).toBeHidden();
    await expect(combobox).not.toHaveText("All entities");
    const panel = await page.locator('[data-section="filter-bar"] details form').boundingBox();
    expect(panel && panel.x >= 0 && panel.x + panel.width <= 390).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  for (const locale of ["ar", "en"] as const) {
    test(`${locale} open filter panel and listbox have no serious axe violations`, async ({ page }) => {
      const combobox = await openPanel(page, locale);
      await combobox.click();
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }
});
