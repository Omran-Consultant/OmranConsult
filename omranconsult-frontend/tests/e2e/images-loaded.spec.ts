import { expect, test } from "@playwright/test";

import { scrollThroughPage, unloadedImages } from "./scroll-images.mjs";

const PAGES = [
  { name: "home", path: "" },
  { name: "projects", path: "/projects" },
  { name: "media", path: "/media" },
] as const;

for (const { name, path } of PAGES) {
  for (const locale of ["ar", "en"] as const) {
    for (const width of [1440, 390] as const) {
      test(`${name} loads every rendered image (${locale}, ${width})`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}${path}`);
        await scrollThroughPage(page);

        expect(await unloadedImages(page)).toEqual([]);
      });
    }
  }
}
