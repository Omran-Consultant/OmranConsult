import { expect, test } from "@playwright/test";

import { loginToDashboard, setDashboardSurface, waitReady } from "./dashboard-helpers";

const DASHBOARD_PAGES = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/users",
  "/dashboard/activity",
  "/dashboard/media",
  "/dashboard/profile",
  "/dashboard/inquiries",
  "/dashboard/disputes",
  "/dashboard/settings",
] as const;

test.describe("dashboard copy quality", () => {
  test("arabic surfaces avoid raw keys, ISO timestamps, and English statuses", async ({ page }) => {
    await loginToDashboard(page);
    await setDashboardSurface(page, "ar", "light", 1440);
  for (const href of DASHBOARD_PAGES) {
      await page.goto(href);
      await waitReady(page);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(/[a-z]+_[a-z0-9_]+/);
      expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
      expect(text).not.toMatch(/\bpublished\b/i);
      expect(text).not.toMatch(/\bsuper_admin\b/);
    }
  });
});
