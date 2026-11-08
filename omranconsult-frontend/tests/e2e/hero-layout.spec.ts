import { expect, test } from "@playwright/test";

const WIDTHS = [1024, 1100, 1180, 1280, 1366, 1440] as const;
const NAV_WIDTHS = [1024, 1100, 1180, 1280, 1440] as const;

type Box = { left: number; right: number; top: number; bottom: number };

function overlapX(a: Pick<Box, "left" | "right">, b: Pick<Box, "left" | "right">): number {
  return Math.min(a.right, b.right) - Math.max(a.left, b.left);
}

function rectsIntersect(a: Box, b: Box): boolean {
  return overlapX(a, b) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;
}

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

      expect(overlapX(boxes.headline, boxes.ring), `ring ${JSON.stringify(boxes.ring)} vs headline ${JSON.stringify(boxes.headline)}`).toBeLessThanOrEqual(1);

      if (locale === "ar" && [1024, 1100, 1180, 1280].includes(width)) {
        await hero.screenshot({ path: `../review-shots/perf-seo/hero-${width}.png` });
      }
    });
  }

  for (const width of NAV_WIDTHS) {
    test(`header nav stays one line and clear of the earth ring at ${width}px (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}`);
      const header = page.locator('[data-section="header"]');
      const hero = page.locator('[data-section="hero"]');
      await expect(hero.locator("h1")).toBeVisible();
      await page.waitForTimeout(1500);

      const nav = header.getByRole("navigation");
      const menuButton = header.getByRole("button", { name: locale === "ar" ? "فتح القائمة" : "Open menu" });
      const navVisible = await nav.isVisible();

      if (!navVisible) {
        await expect(menuButton).toBeVisible();
      } else {
        const links = nav.getByRole("link");
        const count = await links.count();
        expect(count).toBeGreaterThan(0);

        const measurements = await page.evaluate(() => {
          const headerEl = document.querySelector("[data-section='header']")!;
          const navEl = headerEl.querySelector("nav")!;
          const heroEl = document.querySelector("[data-section='hero']")!;
          const headerBox = headerEl.getBoundingClientRect();
          const ringBox = Array.from(heroEl.querySelectorAll("[data-hero-ring]"))
            .map((node) => node.getBoundingClientRect())
            .find((rect) => rect.width > 0)!;
          const visibleRing = {
            left: Math.max(ringBox.left, 0),
            right: Math.min(ringBox.right, window.innerWidth),
            top: Math.max(ringBox.top, headerBox.bottom),
            bottom: Math.min(ringBox.bottom, heroEl.getBoundingClientRect().bottom),
          };
          return Array.from(navEl.querySelectorAll("a")).map((link) => {
            const box = link.getBoundingClientRect();
            const style = getComputedStyle(link);
            return {
              text: link.textContent?.trim() ?? "",
              whiteSpace: style.whiteSpace,
              height: box.height,
              lineHeight: Number.parseFloat(style.lineHeight),
              box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
              visibleRing,
            };
          });
        });

        for (const item of measurements) {
          expect(item.whiteSpace, item.text).toBe("nowrap");
          expect(Math.round(item.height / item.lineHeight), `${item.text} height ${item.height} vs line-height ${item.lineHeight}`).toBe(1);
          expect(rectsIntersect(item.box, item.visibleRing), `${item.text} ${JSON.stringify(item.box)} vs ring ${JSON.stringify(item.visibleRing)}`).toBe(false);
        }
      }

      await page.screenshot({
        clip: { x: 0, y: 0, width, height: 280 },
        path: `../review-shots/perf-seo/hero-header-${locale}-${width}.png`,
      });
    });
  }
}
