import { defineConfig, devices } from "@playwright/test";

/** E2E_PORT lets the suite run beside a dev server that already holds 3000. */
const port = process.env.E2E_PORT ?? "3000";
const origin = `http://127.0.0.1:${port}`;
const revalidationSecret = process.env.REVALIDATION_SECRET || "playwright-revalidate-secret";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: origin,
    trace: "on-first-retry",
  },
  webServer: {
    command:
      `API_BASE_URL=http://localhost:8000 NEXT_PUBLIC_SITE_URL=${origin} REVALIDATION_SECRET=${revalidationSecret} npm run build && API_BASE_URL=http://localhost:8000 NEXT_PUBLIC_SITE_URL=${origin} REVALIDATION_SECRET=${revalidationSecret} npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: `${origin}/en`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
