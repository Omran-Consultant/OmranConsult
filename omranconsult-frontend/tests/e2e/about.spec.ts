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
  const clientTiles = page.locator('[data-section="clients"] li');
  await expect(page.locator('[data-section="clients"] img')).toHaveCount(await clientTiles.count());
});

test("the clients grid shows every client-list record, unnamed ones with a neutral alt", async ({ page, request }) => {
  const api = await request.get(`${process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8000"}/api/clients`, { headers: { "Accept-Language": "ar" } });
  const listed = ((await api.json()) as { data: { in_client_list: boolean }[] }).data.filter((client) => client.in_client_list).length;
  expect(listed).toBe(30);

  for (const [path, alt] of [
    ["/ar/about", "شعار عميل"],
    ["/en/about", "Client logo"],
    ["/ar/projects", "شعار عميل"],
    ["/en/projects", "Client logo"],
  ] as const) {
    await page.goto(path);
    const logos = page.locator('[data-section="clients"] li img');
    await expect(logos).toHaveCount(listed);
    // Profile logos 23 and 30 have no readable name (open content_disputes): neutral alt, profile order.
    await expect(page.locator(`[data-section="clients"] li img[alt="${alt}"]`)).toHaveCount(2);
    const sources = await logos.evaluateAll((nodes) => nodes.map((node) => decodeURIComponent(node.getAttribute("src") ?? "")));
    expect(sources[22]).toContain("client-23.png");
    expect(sources[29]).toContain("client-30.png");
  }
});

test.describe("client logo tiles follow the profile clients page", () => {
  for (const [width, columns] of [
    [1440, 5],
    [1024, 4],
    [768, 3],
    [390, 2],
  ] as const) {
    test(`${columns} columns of 3:1 tiles at ${width} on About and Projects`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/ar/about", "/ar/projects"]) {
        await page.goto(path);
        // Streamed sections sit in a hidden container until React swaps them in.
        await expect(page.locator('[data-section="clients"] [data-logo-tile]').first()).toBeVisible();
        const boxes = await page.locator('[data-section="clients"] [data-logo-tile]').evaluateAll((nodes) =>
          nodes.map((node) => {
            const tile = node.getBoundingClientRect();
            const logo = node.querySelector("img");
            return {
              top: Math.round(tile.top),
              ratio: tile.width / tile.height,
              border: getComputedStyle(node).borderTopWidth,
              background: getComputedStyle(node).backgroundColor,
              fit: logo ? getComputedStyle(logo).objectFit : "contain",
            };
          }),
        );
        expect(boxes).toHaveLength(30);
        expect(boxes.filter((box) => box.top === boxes[0]?.top)).toHaveLength(columns);
        for (const box of boxes) {
          expect(box.ratio).toBeGreaterThan(2.9);
          expect(box.ratio).toBeLessThan(3.1);
          expect(box.border).toBe("1px");
          expect(box.background).toBe("rgb(255, 255, 255)");
          expect(box.fit).toBe("contain");
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      }
    });
  }

  test("tiles stay white in the dark theme", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("oc-theme", "dark"));
    await page.goto("/ar/about");
    await expect(page.locator("html")).toHaveClass(/dark/);
    const tile = page.locator('[data-section="clients"] [data-logo-tile]').first();
    await expect(tile).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
});

test("credentials show every certificate and license scan", async ({ page }) => {
  await page.goto("/ar/about#credentials");
  const section = page.locator("#credentials");
  await expect(section.locator("[data-credential-scan]")).toHaveCount(13);
  await expect(section.getByText("منتهية")).toHaveCount(0);
  const card = section.getByRole("button", { name: /ISO 9001/ });
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
