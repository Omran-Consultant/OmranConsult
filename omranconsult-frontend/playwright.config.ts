import { defineConfig, devices } from "@playwright/test";

import { loadE2eEnv } from "./tests/e2e/load-e2e-env";

loadE2eEnv();

/** E2E_PORT lets the suite run beside a dev server that already holds 3000. */
const port = process.env.E2E_PORT ?? "3000";
const origin = `http://localhost:${port}`;

const PUBLIC_SPECS =
  /(about|cards-a11y|console-clean|contact|equal-card-heights|error-state|hero-layout|hero-rings|home|images-loaded|layout|llms|media|projects|public-routes|robustness|seo|seo-pages|services|unknown-slug)\.spec\.ts$/;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL: origin,
    trace: "on-first-retry",
  },
  webServer: {
    // The production build runs before global setup and keeps `.next/cache/fetch-cache`.
    // Seed the E2E database and drop that cache first, or public pages render the previous run.
    // Arm the API before the build too: pages prerendered at build time read it, and an unarmed
    // API serves the dev database (global setup arms it again; teardown disarms).
    command: [
      "rm -rf .next/cache/fetch-cache",
      "php ../omranconsult-backend/artisan e2e:prepare-database",
      `php ../omranconsult-backend/artisan e2e:arm-harness --frontend-url=${origin}`,
      "npm run build",
      `npm run start -- --hostname localhost --port ${port}`,
    ].join(" && "),
    url: `${origin}/en`,
    reuseExistingServer: false,
    timeout: 240_000,
    env: {
      ...process.env,
      API_BASE_URL: "http://localhost:8000",
      NEXT_PUBLIC_SITE_URL: origin,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
    // SITE_POLISH P2: the public suite on Safari and two phones. The dashboard is a desktop tool.
    {
      name: "webkit",
      testMatch: PUBLIC_SPECS,
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "iphone-15",
      testMatch: PUBLIC_SPECS,
      // Header links, Home sector chips, profile download and footer newsletter are desktop-only (Figma).
      grepInvert: /@desktop/,
      use: { ...devices["iPhone 15"] },
    },
    {
      name: "pixel-7",
      testMatch: PUBLIC_SPECS,
      // Header links, Home sector chips, profile download and footer newsletter are desktop-only (Figma).
      grepInvert: /@desktop/,
      use: { ...devices["Pixel 7"], channel: "chrome" },
    },
  ],
});
