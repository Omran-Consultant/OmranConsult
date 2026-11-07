import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const ROOT = path.resolve(process.cwd(), "..");
const OUT = path.resolve(ROOT, "review-shots/phase4-parity");
const APP_BASE = process.env.APP_BASE ?? "http://127.0.0.1:3000";
const PROTO_BASE = process.env.PROTOTYPE_BASE ?? "http://127.0.0.1:4173";
const LOCALE = "ar";
const WIDTHS = [1440, 390];

/** @type {Array<{ page: string; name: string; proto?: string; impl: string }>} */
const SECTIONS = [
  { page: "home", name: "hero", proto: ".hero", impl: '[data-section="hero"]' },
  { page: "home", name: "stats", proto: "section[aria-labelledby='stats-h']", impl: '[data-section="stats"]' },
  { page: "home", name: "about", proto: "section.about", impl: '[data-section="about"]' },
  { page: "home", name: "strategy", proto: ".strategy", impl: '[data-section="strategy"]' },
  { page: "home", name: "services", proto: "section.services", impl: '[data-section="services"]' },
  { page: "home", name: "projects", proto: "section.work", impl: '[data-section="projects"]' },
  { page: "home", name: "credentials", proto: "section.proof", impl: '[data-section="credentials"]' },
  { page: "home", name: "experts", proto: "section.experts", impl: '[data-section="experts"]' },
  { page: "home", name: "contact", proto: "section.contact", impl: '[data-section="contact"]' },
  { page: "about", name: "about", proto: "section.about", impl: '[data-section="about"]' },
  { page: "about", name: "education-goals", proto: ".stepper", impl: '[data-section="education-goals"]' },
  { page: "about", name: "strategy", proto: ".strategy", impl: '[data-section="strategy"]' },
  { page: "about", name: "work-stages", proto: ".how", impl: '[data-section="work-stages"]' },
  { page: "about", name: "esg", proto: ".esg", impl: '[data-section="esg"]' },
  { page: "about", name: "tools", proto: ".tools", impl: '[data-section="tools"]' },
  { page: "about", name: "experts", proto: "section.experts", impl: '[data-section="experts"]' },
  { page: "about", name: "org-chart", proto: ".org", impl: '[data-section="org-chart"]' },
  { page: "about", name: "credentials", proto: "section.proof", impl: '[data-section="credentials"]' },
  { page: "projects", name: "map", proto: "section.work .mapper", impl: '[data-section="map"]' },
  { page: "projects", name: "filters", proto: "section.work", impl: '[data-section="filters"]' },
  { page: "projects", name: "grid", proto: "section.work .scatter", impl: '[data-section="grid"]' },
  { page: "projects", name: "clients", proto: "section.proof ul.names", impl: '[data-section="clients"]' },
  { page: "services", name: "header", impl: '[data-section="header"]' },
  { page: "services", name: "axes", proto: "section.services", impl: '[data-section="axes"]' },
  { page: "services", name: "asset-management", proto: ".assets-block", impl: '[data-section="asset-management"]' },
  { page: "services", name: "offerings", proto: ".offers", impl: '[data-section="offerings"]' },
  { page: "services", name: "engineering", proto: "section.eng", impl: '[data-section="engineering"]' },
  { page: "services", name: "approach", proto: "section.how", impl: '[data-section="approach"]' },
];

async function preparePage(page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 400);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((resolve) => {
      const deadline = Date.now() + 8000;
      const check = () => {
        const pending = Array.from(document.images).some((img) => !img.complete);
        if (!pending || Date.now() > deadline) {
          resolve();
          return;
        }
        requestAnimationFrame(check);
      };
      check();
    });
    window.scrollTo(0, 0);
  });
}

async function captureSection(page, selector) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  return locator.screenshot({ animations: "disabled" });
}

async function stitchSheets({ implBuffer, protoBuffer, outPath, width }) {
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: width * 2 + 80, height: 1200 } });
  const implData = implBuffer.toString("base64");
  const protoData = protoBuffer.toString("base64");
  await page.setContent(`
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #111; color: #fff; }
      .wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 12px; }
      figure { margin: 0; }
      figcaption { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
      img { width: 100%; height: auto; display: block; background: #222; }
    </style>
    <div class="wrap">
      <figure>
        <figcaption>Implementation</figcaption>
        <img alt="" src="data:image/png;base64,${implData}" />
      </figure>
      <figure>
        <figcaption>Prototype</figcaption>
        <img alt="" src="data:image/png;base64,${protoData}" />
      </figure>
    </div>
  `);
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({ width: width * 2 + 80, height: Math.max(height, 400) });
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

const protoContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-SA" });
const protoPage = await protoContext.newPage();
await protoPage.goto(`${PROTO_BASE}/index.html`, { waitUntil: "domcontentloaded" });

for (const viewportWidth of WIDTHS) {
  await protoPage.setViewportSize({ width: viewportWidth, height: 900 });
  await preparePage(protoPage);

  const implContext = await browser.newContext({ viewport: { width: viewportWidth, height: 900 }, locale: "ar-SA" });

  for (const pageKey of ["home", "about", "projects", "services"]) {
    const implPage = await implContext.newPage();
    const route =
      pageKey === "home"
        ? `/${LOCALE}`
        : pageKey === "about"
          ? `/${LOCALE}/about`
          : pageKey === "projects"
            ? `/${LOCALE}/projects`
            : `/${LOCALE}/services`;
    await implPage.goto(`${APP_BASE}${route}`, { waitUntil: "domcontentloaded" });
    await preparePage(implPage);

    for (const section of SECTIONS.filter((entry) => entry.page === pageKey)) {
      if (!section.proto) {
        continue;
      }
      const [implShot, protoShot] = await Promise.all([
        captureSection(implPage, section.impl),
        captureSection(protoPage, section.proto),
      ]);
      const outPath = path.join(OUT, `${pageKey}-${section.name}-${viewportWidth}.png`);
      await stitchSheets({ implBuffer: implShot, protoBuffer: protoShot, outPath, width: viewportWidth });
    }

    await implPage.close();
  }

  await implContext.close();
}

await protoContext.close();
await browser.close();
await writeFile(
  path.join(OUT, "README.txt"),
  `Generated ${new Date().toISOString()}\nAPP_BASE=${APP_BASE}\nPROTOTYPE_BASE=${PROTO_BASE}\n`,
);
