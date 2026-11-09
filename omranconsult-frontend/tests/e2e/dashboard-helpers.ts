import { expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { artisan } from "./artisan";

export const DASHBOARD_SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5A");
export const SURFACE_WIDTHS = [1440, 1024, 768, 390] as const;
export const SURFACE_LOCALES = ["ar", "en"] as const;
export const SURFACE_THEMES = ["light", "dark"] as const;

export async function setDashboardSurface(
  page: Page,
  locale: (typeof SURFACE_LOCALES)[number],
  theme: (typeof SURFACE_THEMES)[number],
  width: (typeof SURFACE_WIDTHS)[number],
) {
  await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
  await page.context().addCookies([
    { name: "DASHBOARD_LOCALE", value: locale, url: "http://localhost:3000" },
    { name: "oc-theme", value: theme, url: "http://localhost:3000" },
  ]);
}

export async function captureReady(page: Page, name: string) {
  await waitReady(page);
  mkdirSync(DASHBOARD_SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(DASHBOARD_SHOTS, `${name}.png`), fullPage: true });
}

export async function capturePreview(page: Page, name: string) {
  await expect(page.locator("[data-preview-banner]")).toBeVisible();
  mkdirSync(DASHBOARD_SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(DASHBOARD_SHOTS, `${name}.png`), fullPage: true });
}

export function adminCredentials(): { email: string; password: string } {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD must be set");
  }

  return { email, password };
}

export function editorCredentials(): { email: string; password: string } {
  return { email: "e2e-editor@omran.test", password: adminCredentials().password };
}

export async function waitReady(page: Page) {
  await page.locator('[data-ready="true"]').first().waitFor({ state: "visible", timeout: 20_000 });
  await expect(page.locator(".animate-shimmer")).toHaveCount(0);
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/dashboard/login");
  await waitReady(page);
  if ((await page.locator("#email").count()) === 0) {
    return;
  }
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /دخول|Sign in/i }).click();
}

export async function loginToDashboard(page: Page, email = adminCredentials().email, password = adminCredentials().password) {
  artisan(["cache:clear"]);
  await loginAs(page, email, password);
  if (!page.url().includes("/dashboard") || page.url().includes("/login")) {
    await page.waitForURL((url) => url.pathname === "/dashboard", { timeout: 20_000 });
  }
  await waitReady(page);
}

export async function logoutDashboard(page: Page) {
  await page.getByRole("button", { name: /خروج|Log out/i }).click();
  await page.waitForURL(/\/dashboard\/login/);
}

export function uniqueTestEmail(prefix: string): string {
  return `${prefix}-${Date.now()}@omran.test`;
}

export function inviteAcceptPath(email: string): string {
  const output = artisan(["e2e:invite-url", email]);
  const match = output.match(/https?:\/\/\S+/);
  if (!match) {
    throw new Error("e2e:invite-url did not print a URL");
  }
  const url = new URL(match[0]);

  return `${url.pathname}${url.search}`;
}

export async function inviteAndAccept(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await loginToDashboard(page);
  await page.goto("/dashboard/users");
  await waitReady(page);
  await page.locator("#invite-name").fill(name);
  await page.locator("#invite-email").fill(email);
  await page.locator("form").getByRole("button", { name: /^دعوة$|^Invite$/ }).click();
  await expect(page.getByRole("cell", { name: email })).toBeVisible();
  const acceptPath = inviteAcceptPath(email);
  await logoutDashboard(page);
  await page.goto(acceptPath);
  await page.getByLabel(/كلمة المرور|Password/i).first().fill(password);
  await page.getByLabel(/تأكيد|Confirm/i).fill(password);
  await page.getByRole("button", { name: /تعيين كلمة المرور|Set password/i }).click();
  await page.waitForURL(/\/dashboard\/login/);
}

export async function deactivateUserByEmail(page: Page, email: string) {
  await loginToDashboard(page);
  await page.goto("/dashboard/users");
  await waitReady(page);
  const row = page.locator("tr", { hasText: email });
  if ((await row.count()) === 0) {
    return;
  }
  const toggle = row.getByRole("button", { name: /تعطيل|Deactivate/i });
  if (await toggle.count()) {
    await toggle.click();
  }
}

export function validJpegUpload() {
  const buffer = readFileSync(path.join(process.cwd(), "public/images/og-default.jpg"));

  return { name: "e2e-valid.jpg", mimeType: "image/jpeg" as const, buffer };
}

export function spoofedSvgAsJpeg() {
  return {
    name: "e2e-spoof.jpg",
    mimeType: "image/jpeg" as const,
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect width="8" height="8"/></svg>'),
  };
}
