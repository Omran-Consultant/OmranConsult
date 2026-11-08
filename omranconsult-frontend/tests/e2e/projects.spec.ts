import { expect, test } from "@playwright/test";

const DETAIL = "/ar/projects/king-saud-university-operation-and-maintenance-efficiency";

test("projects renders the design sections in order", async ({ page }) => {
  await page.goto("/ar/projects");
  const sections = await page.locator("main [data-section]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section")));
  expect(sections).toEqual(["page-hero", "filter-bar", "grid", "clients"]);
  await expect(page.locator("h1")).toHaveText("مشاريعنا");
  await expect(page.locator('[data-section="filter-bar"] li a')).toHaveCount(9);
  await expect(page.locator('[data-section="grid"] ul').first().locator("li")).toHaveCount(9);
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
  await page.getByRole("searchbox", { name: "ابحث عن مشروع" }).fill("جامعة");
  await expect(page).toHaveURL(/q=/);
  await expect(page.locator('[data-section="grid"] ul').first().locator("li")).toHaveCount(2);

  await page.getByRole("searchbox", { name: "ابحث عن مشروع" }).fill("لا يوجد مشروع بهذا الاسم");
  await expect(page.getByText("لا توجد مشاريع مطابقة للبحث")).toBeVisible();
  await page.getByRole("link", { name: "مسح الفلاتر" }).click();
  await expect(page).toHaveURL(/\/ar\/projects$/);
  await expect(page.getByRole("searchbox", { name: "ابحث عن مشروع" })).toHaveValue("");
});

test("pagination moves to the next page on desktop", async ({ page }) => {
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
  expect(body).toMatchObject({ source: "project", project_slug: "king-saud-university-operation-and-maintenance-efficiency", name: "مهندس تجربة" });
});
