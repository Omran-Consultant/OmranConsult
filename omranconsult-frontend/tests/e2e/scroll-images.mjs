/**
 * Shared by the Playwright image check and the screenshot script: next/image lazy-loads, so a
 * full-page capture without scrolling shows blank frames even when the page is fine.
 * Hidden layouts (display: none) and carousel slides outside the viewport width never load by design.
 */
export async function scrollThroughPage(page) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: "instant" });
      await pause(150);
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    await pause(150);
  });
}

/** Returns the rendered images that did not load within the timeout; an empty list means all loaded. */
export async function unloadedImages(page, timeout = 15_000) {
  const collect = () =>
    Array.from(document.images)
      .filter((image) => {
        const rect = image.getBoundingClientRect();
        return image.checkVisibility() && rect.width > 0 && rect.right > 0 && rect.left < window.innerWidth;
      })
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src);

  const deadline = Date.now() + timeout;
  let missing = await page.evaluate(collect);
  while (missing.length > 0 && Date.now() < deadline) {
    await page.waitForTimeout(200);
    missing = await page.evaluate(collect);
  }
  return missing;
}
