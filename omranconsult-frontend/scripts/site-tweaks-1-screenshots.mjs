#!/usr/bin/env node
/**
 * Dev script: full-page captures of the public pages for visual review (git-ignored output).
 * APP_BASE, SHOTS_DIR, RICH_SLUG, POOR_SLUG and ONLY (comma-separated route keys) override the defaults.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { scrollThroughPage, unloadedImages } from "../tests/e2e/scroll-images.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.resolve(ROOT, process.env.SHOTS_DIR ?? "review-shots/site-tweaks-1/after-2");
const APP_BASE = process.env.APP_BASE ?? "http://localhost:3000";
const RICH_SLUG = process.env.RICH_SLUG ?? "king-saud-university-operation-and-maintenance-efficiency";
const POOR_SLUG = process.env.POOR_SLUG ?? "dams-operation-and-maintenance-efficiency-consulting";

const ROUTES = {
  home: "",
  projects: "/projects",
  "project-rich": `/projects/${RICH_SLUG}`,
  "project-poor": `/projects/${POOR_SLUG}`,
  media: "/media",
};

const SHOTS = [
  { width: 1440, theme: "light" },
  { width: 1440, theme: "dark" },
  { width: 390, theme: "light" },
  { width: 390, theme: "dark" },
];

const only = process.env.ONLY?.split(",");
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;

for (const [key, route] of Object.entries(ROUTES)) {
  if (only && !only.includes(key)) {
    continue;
  }
  for (const locale of ["ar", "en"]) {
    for (const { width, theme } of SHOTS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: locale === "ar" ? "ar-SA" : "en-US" });
      if (theme === "dark") {
        await context.addInitScript(() => localStorage.setItem("oc-theme", "dark"));
      }
      const page = await context.newPage();
      await page.goto(`${APP_BASE}/${locale}${route}`, { waitUntil: "load" });
      await scrollThroughPage(page);
      const missing = await unloadedImages(page, 30_000);
      await page.evaluate(() => {
        document.querySelectorAll("[data-reveal]").forEach((node) => node.setAttribute("data-revealed", ""));
        window.scrollTo({ top: 0, behavior: "instant" });
      });
      await page.waitForTimeout(800);
      const file = path.join(OUT, `${key}-${locale}-${width}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${missing.length === 0 ? "ok  " : "MISS"} ${path.relative(ROOT, file)}${missing.length ? ` ${missing.join(" ")}` : ""}`);
      failures += missing.length;
      await context.close();
    }
  }
}

await browser.close();
process.exitCode = failures > 0 ? 1 : 0;
