#!/usr/bin/env node
/**
 * Screenshot one section of a public page for visual QA (git-ignored `review-shots/`).
 *
 *   APP_BASE=http://localhost:3100 node scripts/section-shot.mjs \
 *     --path=/ar/about --selector='[data-section="clients"]' --out=site-tweaks-2/c2-about-ar \
 *     [--widths=1440,1024,768,390] [--theme=light|dark]
 *
 * Reports horizontal page overflow per width and exits non-zero when any is found.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP_BASE = process.env.APP_BASE ?? "http://localhost:3100";

function arg(name, fallback) {
  const hit = process.argv.find((value) => value.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

const route = arg("path", "/ar/about");
const selector = arg("selector", "main");
const out = arg("out", "section");
const theme = arg("theme", "light");
const widths = arg("widths", "1440").split(",").map(Number);

const browser = await chromium.launch({ channel: "chrome" });
let overflow = false;

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  await context.addInitScript((value) => localStorage.setItem("oc-theme", value), theme);
  const page = await context.newPage();
  await page.goto(`${APP_BASE}${route}`, { waitUntil: "networkidle" });
  // The sticky header would cover the top of the section in the capture.
  await page.addStyleTag({ content: "header { visibility: hidden !important; }" });
  const target = page.locator(selector).first();
  await target.scrollIntoViewIfNeeded();
  // Let lazy images and the one-shot entrance animations settle.
  await page.waitForTimeout(2500);
  const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  if (scrolls) {
    overflow = true;
    console.error(`horizontal overflow at ${width}: ${route}`);
  }
  const file = path.join(ROOT, "review-shots", `${out}-${width}-${theme}.png`);
  await mkdir(path.dirname(file), { recursive: true });
  await target.screenshot({ path: file });
  console.log(file);
  await context.close();
}

await browser.close();
process.exit(overflow ? 1 : 0);
