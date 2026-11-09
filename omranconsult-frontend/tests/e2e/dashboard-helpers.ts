import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import { artisan } from "./artisan";

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
  await page.getByLabel(/البريد|Email/i).fill(email);
  await page.getByLabel(/كلمة المرور|Password/i).first().fill(password);
  await page.getByRole("button", { name: /دخول|Sign in/i }).click();
}

export async function loginToDashboard(page: Page, email = adminCredentials().email, password = adminCredentials().password) {
  await loginAs(page, email, password);
  await page.waitForURL((url) => url.pathname === "/dashboard");
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
  await page.getByLabel(/^الاسم$|^Name$/).fill(name);
  await page.getByLabel(/^البريد$|^Email$/).fill(email);
  await page.getByRole("button", { name: /دعوة|Invite/ }).click();
  await expect(page.getByText(/أُرسلت الدعوة|Invitation sent/i)).toBeVisible();
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
