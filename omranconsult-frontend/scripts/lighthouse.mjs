#!/usr/bin/env node
/**
 * Lighthouse medians for the public pages, mobile and desktop.
 *
 * Desktop uses `--preset=desktop`, which sets desktop screen emulation AND desktop throttling
 * (40 ms RTT, 10 Mbps, CPU 1x). Passing only `--form-factor=desktop` keeps the mobile throttling
 * (CPU 4x), which makes desktop and mobile metrics identical. Each summary records the applied
 * form factor and CPU multiplier so the preset can be checked.
 *
 * Usage: node scripts/lighthouse.mjs <out-dir> [base-url] [runs]
 * Needs a production build running (`npm run build && npm run start`) and the API.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [outDir, base = "http://localhost:3000", runsArg = "3"] = process.argv.slice(2);
if (!outDir) {
  console.error("Usage: node scripts/lighthouse.mjs <out-dir> [base-url] [runs]");
  process.exit(1);
}
const runs = Number(runsArg);
const LIGHTHOUSE = "lighthouse@12.8.2";
const ROUTES = ["/en", "/ar", "/en/about", "/ar/about", "/en/projects", "/ar/projects"];
const PRESETS = { mobile: [], desktop: ["--preset=desktop"] };

mkdirSync(outDir, { recursive: true });

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};

const rows = [];
for (const route of ROUTES) {
  for (const [preset, flags] of Object.entries(PRESETS)) {
    const reports = [];
    for (let run = 1; run <= runs; run += 1) {
      const name = `${route.replaceAll("/", "-").slice(1)}-${preset}-${run}`;
      const file = path.join(outDir, `${name}.json`);
      execFileSync(
        "npx",
        ["-y", LIGHTHOUSE, `${base}${route}`, ...flags, "--output=json", `--output-path=${file}`, "--quiet", "--chrome-flags=--headless=new"],
        { stdio: "inherit" },
      );
      reports.push(JSON.parse(readFileSync(file, "utf8")));
    }
    const score = (key) => median(reports.map((report) => Math.round((report.categories[key]?.score ?? 0) * 100)));
    const metric = (key) => median(reports.map((report) => report.audits[key]?.numericValue ?? 0));
    const settings = reports[0].configSettings;
    rows.push({
      route,
      preset,
      formFactor: settings.formFactor,
      cpuSlowdown: settings.throttling?.cpuSlowdownMultiplier,
      rttMs: settings.throttling?.rttMs,
      performance: score("performance"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      seo: score("seo"),
      lcpMs: Math.round(metric("largest-contentful-paint")),
      fcpMs: Math.round(metric("first-contentful-paint")),
      tbtMs: Math.round(metric("total-blocking-time")),
      cls: Number(metric("cumulative-layout-shift").toFixed(3)),
      failingSeoAudits: [
        ...new Set(
          reports.flatMap((report) =>
            report.categories.seo.auditRefs.filter((ref) => ref.weight > 0 && report.audits[ref.id]?.score === 0).map((ref) => ref.id),
          ),
        ),
      ],
    });
  }
}

writeFileSync(path.join(outDir, "summary.json"), `${JSON.stringify(rows, null, 2)}\n`);
console.table(rows.map(({ failingSeoAudits, ...row }) => ({ ...row, seoFails: failingSeoAudits.join(" ") })));
