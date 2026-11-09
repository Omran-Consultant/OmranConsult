import { defineConfig, devices } from "@playwright/test";

import { loadE2eEnv } from "./tests/e2e/load-e2e-env";

loadE2eEnv();

/** E2E_PORT lets the suite run beside a dev server that already holds 3000. */
const port = process.env.E2E_PORT ?? "3000";
const origin = `http://localhost:${port}`;

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
    command: `npm run build && npm run start -- --hostname localhost --port ${port}`,
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
  ],
});
