import { expect, test } from "@playwright/test";

const WIDTHS = [1024, 1100, 1180, 1280, 1366, 1440] as const;

for (const locale of ["ar", "en"] as const) {
  for (const width of WIDTHS) {
    test(`hero headline and earth ring never intersect at ${width}px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}`);
      const hero = page.locator('[data-section="hero"]');
      await expect(hero.locator("h1")).toBeVisible();
      // The ring rotates in for 1.2 s; measure once it has settled.
      await page.waitForTimeout(1500);

      const boxes = await hero.evaluate((section) => {
        const headline = section.querySelector("h1")!.getBoundingClientRect();
        const ring = Array.from(section.querySelectorAll("[data-hero-ring]"))
          .map((node) => node.getBoundingClientRect())
          .find((rect) => rect.width > 0)!;
        // The section clips the ring, so only the part inside the viewport is visible.
        const visible = {
          left: Math.max(ring.left, 0),
          right: Math.min(ring.right, window.innerWidth),
        };
        return {
          headline: { left: headline.left, right: headline.right },
          ring: visible,
        };
      });

      const overlap = Math.min(boxes.headline.right, boxes.ring.right) - Math.max(boxes.headline.left, boxes.ring.left);
      expect(overlap, `ring ${JSON.stringify(boxes.ring)} vs headline ${JSON.stringify(boxes.headline)}`).toBeLessThanOrEqual(1);

      if (locale === "ar" && [1024, 1100, 1180, 1280].includes(width)) {
        await hero.screenshot({ path: `../review-shots/perf-seo/hero-${width}.png` });
      }
    });
  }
}
