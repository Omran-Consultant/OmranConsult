#!/usr/bin/env node
/**
 * Full-page screenshots for visual QA (PHASE4C_FIGMA §9.2): every public route × ar/en ×
 * 1440/768/390 in dark, plus 1440 in light. `--light-pass` captures every route in the
 * default light theme at all three widths, including the localized 404 and mobile menu.
 * Asserts the theme before each capture and reports horizontal overflow.
 *
 *   APP_BASE=http://127.0.0.1:3100 node scripts/route-screenshots.mjs [--routes=home,contact]
 *   APP_BASE=http://127.0.0.1:3100 node scripts/route-screenshots.mjs --light-pass
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const lightPass = process.argv.includes("--light-pass");
const OUT = path.join(ROOT, lightPass ? "review-shots/phase4c-light" : "review-shots/phase4c");
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
  ...(lightPass ? { "not-found": "/does-not-exist" } : {}),
};

const SHOTS = lightPass
  ? [
      { width: 1440, theme: "light" },
      { width: 768, theme: "light" },
      { width: 390, theme: "light" },
    ]
  : [
      { width: 1440, theme: "dark" },
      { width: 768, theme: "dark" },
      { width: 390, theme: "dark" },
      { width: 1440, theme: "light" },
    ];

const only = process.argv.find((arg) => arg.startsWith("--routes="))?.split("=")[1]?.split(",");
const routes = Object.entries(ROUTES).filter(([key]) => !only || only.includes(key));

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const problems = [];

for (const [key, route] of routes) {
  for (const locale of ["ar", "en"]) {
    for (const { width, theme } of SHOTS) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, locale: locale === "ar" ? "ar-SA" : "en-US" });
      if (!lightPass) {
        await context.addInitScript((value) => localStorage.setItem("oc-theme", value), theme);
      }
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

      if (lightPass && key === "home" && width <= 768) {
        await page.getByRole("button", { name: locale === "ar" ? "فتح القائمة" : "Open menu" }).click();
        await page.getByRole("dialog", { name: locale === "ar" ? "القائمة" : "Menu" }).waitFor();
        await page.waitForTimeout(400);
        const menuFile = path.join(OUT, `mobile-menu-${locale}-${width}-light.png`);
        await page.screenshot({ path: menuFile });
        console.log(path.relative(ROOT, menuFile));
      }
      await context.close();
    }
  }
}

await browser.close();
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
