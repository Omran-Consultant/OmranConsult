import { expect, test, type Page } from "@playwright/test";

/** SITE_POLISH P5: the hero arcs rotate into place on load (ring-in), never with reduced motion. */
async function ringAnimations(page: Page) {
  return page.locator("[data-hero-ring]").filter({ visible: true }).first().evaluate((ring) =>
    ring.getAnimations().map((animation) => ({
      name: (animation as CSSAnimation).animationName,
      duration: animation.effect?.getTiming().duration,
      state: animation.playState,
    })),
  );
}

test("the hero arcs run the ring-in animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  const animations = await ringAnimations(page);
  expect(animations).toEqual([expect.objectContaining({ name: "ring-in", duration: 1200 })]);
  expect(["running", "finished"]).toContain(animations[0]?.state);
});

test("the hero arcs stay still with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ar", { waitUntil: "domcontentloaded" });
  expect(await ringAnimations(page)).toEqual([]);
});
