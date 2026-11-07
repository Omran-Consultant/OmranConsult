import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "API_BASE_URL=http://localhost:8000 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 npm run build && API_BASE_URL=http://localhost:8000 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000 npm run start -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/en",
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
