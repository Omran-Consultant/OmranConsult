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

    for (const href of hrefs) {
      const id = href.split("/").pop();
      await page.goto(href);
      await waitReady(page);
      const editorFirst = (await page.locator("#body-ar").inputValue()).trim();

      const slug = await page.locator("#slug").inputValue();
      await page.goto(`/ar/media/${slug}`);
      const publicFirst = (
        await page.locator("[data-section='body'] p, [data-section='body'] h2, [data-section='body'] blockquote").first().innerText()
      ).trim();

      expect(editorFirst, `news ${id} (${slug})`).toBe(publicFirst);
      expect(editorFirst.length, `news ${id} body empty`).toBeGreaterThan(0);
    }
  });
});
