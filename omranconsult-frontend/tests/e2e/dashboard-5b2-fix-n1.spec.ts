import { expect, test } from "@playwright/test";

import { loginToDashboard, resetE2eSeed, setDashboardSurface, waitReady } from "./dashboard-helpers";

test.describe("dashboard 5B-2 fix N1 news body", () => {
  test.describe.configure({ timeout: 180_000 });

  test("each seeded article body matches the public first paragraph", async ({ page }) => {
    resetE2eSeed();
    await loginToDashboard(page);
    await setDashboardSurface(page, "ar", "light", 1440);
    await page.goto("/dashboard/news");
    await waitReady(page);

    const hrefs = await page.locator("a[data-news-id]").evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href")).filter((href): href is string => Boolean(href)),
    );
    expect(hrefs.length).toBeGreaterThan(0);

    let compared = 0;
    for (const href of hrefs) {
      const id = href.split("/").pop();
      await page.goto(href);
      await waitReady(page);
      const editorFirst = (await page.locator("#body-ar").inputValue()).trim();

      const slug = await page.locator("#slug").inputValue();
      await page.goto(`/ar/media/${slug}`);
      // Main column only — the related-news aside also lives under data-section=body.
      const main = page.locator("[data-section='body'] > div > div").first();
      const publicNode = main.locator(":scope > p, :scope > h2, :scope > blockquote").first();
      const publicFirst = (await publicNode.count()) > 0 ? (await publicNode.innerText()).trim() : "";

      expect(editorFirst, `news ${id} (${slug})`).toBe(publicFirst);
      if (publicFirst.length > 0) {
        compared += 1;
        expect(editorFirst.length, `news ${id} body empty`).toBeGreaterThan(0);
      }
    }
    expect(compared, "at least one seeded article has public body text").toBeGreaterThan(0);
  });
});
