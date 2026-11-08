/**
 * Phase 4C parity sheets (docs/briefs/PHASE4C_FIGMA.md §9.1).
 *
 * For every section of a designed page, crop the Figma render by the section's y-range (read from
 * figma-structure.txt) and capture the implementation's `[data-section]` at the same width. The
 * two are placed side by side, implementation on the left and Figma on the right, in
 * review-shots/phase4c-parity/. Dark theme and Arabic by default.
 *
 *   node scripts/parity-sheets.mjs --pages=home --widths=1440,390 [--theme=dark|light] [--sections=hero,stats]
 *
 * APP_BASE defaults to http://127.0.0.1:3000.
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "..");
const REFERENCE = path.join(ROOT, "docs/design-reference/figma-screens");
const OUT = path.join(ROOT, "review-shots/phase4c-parity");
const APP_BASE = process.env.APP_BASE ?? "http://127.0.0.1:3000";

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, value = ""] = arg.replace(/^--/, "").split("=");
    return [key, value];
  }),
);
const PAGES = (args.pages ?? "home").split(",");
const WIDTHS = (args.widths ?? "1440,390").split(",").map(Number);
const THEME = args.theme ?? "dark";
const LOCALE = args.locale ?? "ar";
const ONLY_SECTIONS = args.sections ? new Set(args.sections.split(",")) : undefined;

/** Figma frame title prefix, render file key and route for each page. */
const PAGE_CONFIG = {
  home: { frame: "Home", file: "home", route: "" },
  projects: { frame: "Projects", file: "projects", route: "/projects", mobileAliases: { Filters: "filter-bar", Frame: "filter-bar", List: "grid" } },
  "project-detail": {
    frame: "Project Details",
    file: "project-detail",
    route: "/projects/king-saud-university-operation-and-maintenance-efficiency",
    mobileAliases: { "Page Hero": "hero", Facts: "facts-bar" },
  },
  contact: { frame: "Contact", file: "contact", route: "/contact" },
  about: { frame: "About", file: "about", route: "/about" },
  services: { frame: "Services", file: "services", route: "/services" },
  media: { frame: "Media Center", file: "media", route: "/media" },
  article: { frame: "News Article", file: "article", route: "/media/omran-cop16-technical-audit" },
};

/** Figma frame name → implementation data-section (kebab case unless listed). */
const SECTION_ALIASES = { "Header Area": "header", "CTA Wrap": "cta", "Mobile Header": "header", "Vision Mission": "strategy" };

const toSection = (name) => SECTION_ALIASES[name] ?? name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/**
 * Top-level section frames of "<Page> — Desktop 1440" / "<Page> — Mobile 390" with their y-ranges.
 * `aliases` maps frame names for one page; adjacent frames with the same section are merged.
 */
async function figmaSections(frameTitle, aliases = {}) {
  const lines = (await readFile(path.join(REFERENCE, "figma-structure.txt"), "utf8")).split("\n");
  const start = lines.findIndex((line) => line.startsWith(`  FRAME "${frameTitle}"`));
  if (start < 0) {
    return [];
  }
  const sections = [];
  for (const line of lines.slice(start + 1)) {
    if (/^ {0,2}\S/.test(line)) {
      break;
    }
    const match = line.match(/^ {4}(?:FRAME|INSTANCE) "([^"]+)" \[-?\d+,(-?\d+) (\d+)x(\d+)\]/);
    if (match) {
      const [, name, y, , height] = match;
      const section = aliases[name] ?? toSection(name);
      const previous = sections.at(-1);
      if (previous && previous.section === section) {
        previous.height = Number(y) + Number(height) - previous.y;
      } else {
        sections.push({ name, section, y: Number(y), height: Number(height) });
      }
    }
  }
  return sections;
}

async function preparePage(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight / 2, 300);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll("[data-reveal]").forEach((node) => node.setAttribute("data-revealed", ""));
    // Hidden images (display: none) never load; wait for the visible ones, at most 8 s.
    const pending = [...document.images].filter((img) => !img.complete && img.offsetParent !== null);
    await Promise.race([
      Promise.all(pending.map((img) => new Promise((resolve) => { img.onload = img.onerror = resolve; }))),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
  });
  await page.waitForTimeout(1500);
}

async function stitch(browser, { implBuffer, figmaBuffer, outPath, width, label }) {
  const page = await browser.newPage({ viewport: { width: width * 2 + 72, height: 600 } });
  await page.setContent(`
    <style>
      body { margin: 0; background: #2b2f36; color: #fff; font: 600 14px system-ui, sans-serif; }
      .wrap { display: grid; grid-template-columns: ${width}px ${width}px; gap: 24px; padding: 24px; align-items: start; }
      figcaption { margin-bottom: 8px; }
      img { display: block; width: ${width}px; height: auto; outline: 1px solid #555; }
    </style>
    <div class="wrap">
      <figure style="margin:0"><figcaption>Implementation — ${label}</figcaption><img src="data:image/png;base64,${implBuffer.toString("base64")}"></figure>
      <figure style="margin:0"><figcaption>Figma — ${label}</figcaption><img src="data:image/png;base64,${figmaBuffer.toString("base64")}"></figure>
    </div>`);
  await page.waitForTimeout(100);
  await page.screenshot({ path: outPath, fullPage: true });
  await page.close();
}

async function cropFigma(browser, file, y, height, width) {
  const page = await browser.newPage({ viewport: { width, height: Math.max(1, height) } });
  const data = (await readFile(path.join(REFERENCE, file))).toString("base64");
  await page.setContent(`<body style="margin:0"><img style="display:block;margin-top:-${y}px" src="data:image/png;base64,${data}"></body>`);
  await page.waitForTimeout(100);
  const buffer = await page.screenshot({ clip: { x: 0, y: 0, width, height } });
  await page.close();
  return buffer;
}

async function captureImpl(page, section) {
  const locator = page.locator(`[data-section="${section}"]`).first();
  if ((await locator.count()) === 0) {
    return undefined;
  }
  // Bring the section into view so lazy images are decoded and painted before the clip.
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  // Back to the top so the fixed header is in its initial state (it only overlaps the hero).
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  const box = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    const rect = element.getBoundingClientRect();
    return { x: 0, y: rect.top + window.scrollY, width: document.documentElement.clientWidth, height: rect.height };
  }, `[data-section="${section}"]`);
  return page.screenshot({ clip: box, fullPage: true, animations: "disabled" });
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const written = [];

for (const pageKey of PAGES) {
  const config = PAGE_CONFIG[pageKey];
  for (const width of WIDTHS) {
    const mobile = width < 768;
    const frameTitle = `${config.frame} — ${mobile ? "Mobile 390" : "Desktop 1440"}`;
    const render = `${mobile ? "mobile" : "desktop"}-${config.file}.png`;
    const sections = await figmaSections(frameTitle, mobile ? config.mobileAliases : config.desktopAliases);
    if (sections.length === 0) {
      console.warn(`No Figma frame "${frameTitle}"; skipped.`);
      continue;
    }

    const context = await browser.newContext({ viewport: { width, height: mobile ? 844 : 900 }, locale: LOCALE === "ar" ? "ar-SA" : "en-US" });
    await context.addInitScript((theme) => localStorage.setItem("oc-theme", theme), THEME);
    const page = await context.newPage();
    await page.goto(`${APP_BASE}/${LOCALE}${config.route}`, { waitUntil: "networkidle" });
    const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
    if (isDark !== (THEME === "dark")) {
      throw new Error(`Expected theme ${THEME} on ${pageKey}`);
    }
    await preparePage(page);

    // The header overlays the hero; compare it as its own strip.
    const targets = [{ name: "Header", section: "header", y: 0, height: mobile ? 78 : 116 }, ...sections];
    for (const target of targets) {
      if (ONLY_SECTIONS && !ONLY_SECTIONS.has(target.section)) {
        continue;
      }
      const implBuffer = await captureImpl(page, target.section);
      if (!implBuffer) {
        console.warn(`${pageKey}/${target.section}: no [data-section] in the implementation.`);
        continue;
      }
      // The Figma mobile header frame is clipped at 32 px; compare with the menu frame's header.
      const figmaBuffer =
        mobile && target.section === "header"
          ? await cropFigma(browser, "mobile-menu-open.png", 0, 78, width)
          : await cropFigma(browser, render, target.y, target.height, width);
      const suffix = THEME === "dark" ? "" : `-${THEME}`;
      const outPath = path.join(OUT, `${pageKey}-${target.section}-${width}${suffix}.png`);
      await stitch(browser, { implBuffer, figmaBuffer, outPath, width, label: `${pageKey} / ${target.name} / ${width} / ${THEME}` });
      written.push(path.relative(ROOT, outPath));
    }

    if (mobile && pageKey === "home" && (!ONLY_SECTIONS || ONLY_SECTIONS.has("menu"))) {
      await page.getByRole("button", { name: /القائمة|menu/i }).first().click();
      await page.waitForTimeout(700);
      const implBuffer = await page.screenshot({ animations: "disabled" });
      const figmaBuffer = await cropFigma(browser, "mobile-menu-open.png", 0, 844, width);
      const outPath = path.join(OUT, `menu-open-${width}${THEME === "dark" ? "" : `-${THEME}`}.png`);
      await stitch(browser, { implBuffer, figmaBuffer, outPath, width, label: `mobile menu / ${width} / ${THEME}` });
      written.push(path.relative(ROOT, outPath));
    }

    await context.close();
  }
}

await browser.close();
await writeFile(path.join(OUT, "README.txt"), `Generated ${new Date().toISOString()}\nAPP_BASE=${APP_BASE}\n${written.join("\n")}\n`);
console.log(written.join("\n"));
