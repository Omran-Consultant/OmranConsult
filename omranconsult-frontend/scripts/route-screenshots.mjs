#!/usr/bin/env node
/**
 * Full-page screenshots for visual QA (PHASE4C_FIGMA §9.2): every public route × ar/en ×
 * 1440/768/390 in dark, plus 1440 in light. Asserts the theme before each capture and reports
 * horizontal overflow. Output: review-shots/phase4c/<route>-<locale>-<width>[-light].png
 *
 *   APP_BASE=http://127.0.0.1:3100 node scripts/route-screenshots.mjs [--routes=home,contact]
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "review-shots/phase4c");
const APP_BASE = process.env.APP_BASE ?? "http://127.0.0.1:3100";

const ROUTES = {
  home: "",
  about: "/about",
  services: "/services",
  projects: "/projects",
  "project-detail": "/projects/king-saud-university-operation-and-maintenance-efficiency",
  contact: "/contact",
  media: "/media",
  article: "/media/omran-cop16-technical-audit",
};

const SHOTS = [
  { width: 1440, theme: "dark" },
  { width: 768, theme: "dark" },
  { width: 390, theme: "dark" },
  { width: 1440, theme: "light" },
];

const only = process.argv.find((arg) => arg.startsWith("--routes="))?.split("=")[1]?.split(",");
const routes = Object.entries(ROUTES).filter(([key]) => !only || only.includes(key));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const [key, route] of routes) {
  for (const locale of ["ar", "en"]) {
    for (const { width, theme } of SHOTS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: locale === "ar" ? "ar-SA" : "en-US" });
      await context.addInitScript((value) => localStorage.setItem("oc-theme", value), theme);
      const page = await context.newPage();
      await page.goto(`${APP_BASE}/${locale}${route}`, { waitUntil: "networkidle" });
      const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
      if (isDark !== (theme === "dark")) {
        throw new Error(`Expected theme ${theme} on ${locale}${route}`);
      }
      await page.evaluate(async () => {
        document.querySelectorAll("img[loading=lazy]").forEach((img) => img.setAttribute("loading", "eager"));
        for (let y = 0; y < document.body.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
        window.scrollTo(0, 0);
        document.querySelectorAll("[data-reveal]").forEach((node) => node.setAttribute("data-revealed", ""));
      });
      await page.waitForTimeout(1200);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (overflow > 0) {
        problems.push(`${locale}${route} @${width}: horizontal overflow ${overflow}px`);
      }
      const suffix = theme === "dark" ? "" : `-${theme}`;
      const file = path.join(OUT, `${key}-${locale}-${width}${suffix}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(path.relative(ROOT, file));
      await context.close();
    }
  }
}

await browser.close();
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
