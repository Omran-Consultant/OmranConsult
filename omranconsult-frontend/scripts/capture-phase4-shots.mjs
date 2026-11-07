import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(process.cwd(), "../review-shots/phase4");
const BASE = "http://127.0.0.1:3000";
const ROUTES = ["", "/about", "/services", "/projects", "/projects/cop16-technical-audit"];

/** @type {Array<{ route: string; locale: string; viewport: { width: number; height: number }; dark?: boolean }>} */
const shots = [];

for (const locale of ["en", "ar"]) {
  for (const route of ROUTES) {
    shots.push({ route, locale, viewport: { width: 1440, height: 900 } });
    shots.push({ route, locale, viewport: { width: 390, height: 844 } });
  }
}

shots.push({ route: "", locale: "en", viewport: { width: 1440, height: 900 }, dark: true });
shots.push({ route: "", locale: "ar", viewport: { width: 1440, height: 900 }, dark: true });
shots.push({ route: "/projects", locale: "ar", viewport: { width: 768, height: 1024 } });

function fileName({ route, locale, viewport, dark }) {
  const slug =
    route === ""
      ? "home"
      : route
          .replace(/^\//, "")
          .replace(/^projects\//, "projects-")
          .replaceAll("/", "-");
  return `${slug}-${locale}-${viewport.width}${dark ? "-dark" : ""}.png`;
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

for (const shot of shots) {
  const context = await browser.newContext({ viewport: shot.viewport });
  const page = await context.newPage();
  if (shot.dark) {
    await page.addInitScript(() => {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("oc-theme", "dark");
      } catch {
        /* ignore */
      }
    });
  }
  await page.goto(`${BASE}/${shot.locale}${shot.route}`, { waitUntil: "networkidle" });
  await page.screenshot({ path: path.join(OUT, fileName(shot)), fullPage: true });
  await context.close();
}

await browser.close();
