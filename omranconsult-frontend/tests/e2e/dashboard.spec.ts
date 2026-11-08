import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5A");
const revalidationSecret = process.env.REVALIDATION_SECRET || "playwright-revalidate-secret";

async function shot(page: Page, name: string) {
  mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: true });
}

async function axeClean(page: Page) {
  const axe = await new AxeBuilder({ page }).analyze();
  const severe = axe.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  expect(severe).toEqual([]);
}

test.describe("dashboard isolation", () => {
  test("guest is redirected to login and next open-redirect is blocked", async ({ page }) => {
    await page.goto("/dashboard/projects");
    await page.waitForURL(/\/dashboard\/login/);
    expect(page.url()).toContain("next=");
    await page.goto("/dashboard/login?next=//evil.com");
    const fakeUser = {
      user: {
        id: 1,
        name: "Admin",
        email: "admin@example.com",
        roles: ["super_admin"],
        permissions: ["dashboard.summary.view"],
        is_active: true,
        department: null,
        dashboard_locale: "ar",
        notify_inquiries: false,
        mfa_enabled: false,
        last_login_at: null,
      },
    };
    await page.route("**/api/admin/me", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeUser) });
    });
    await page.route("**/api/admin/login", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fakeUser) });
    });
    await page.getByLabel(/البريد|Email/i).fill("admin@example.com");
    await page.getByLabel(/كلمة المرور|Password/i).first().fill("Password12!");
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await page.waitForURL((url) => url.pathname === "/dashboard");
    expect(page.url()).not.toMatch(/evil\.com/);
    await page.unroute("**/api/admin/login");
    await page.unroute("**/api/admin/me");
    await page.goto("/dashboard/login");
    await page.getByLabel(/البريد|Email/i).fill("nobody@example.com");
    await page.getByLabel(/كلمة المرور|Password/i).first().fill("wrong-password");
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByText(/غير صحيحة|incorrect/i)).toBeVisible();
    await shot(page, "login-ar-light-invalid-1440");
  });

  test("login is noindex and no-store", async ({ page }) => {
    const response = await page.goto("/dashboard/login");
    expect(response?.headers()["x-robots-tag"] ?? "").toMatch(/noindex/i);
    expect(response?.headers()["cache-control"] ?? "").toMatch(/no-store/i);
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await shot(page, "login-ar-light-1440");
  });

  test("login english and dark", async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.getByRole("button", { name: "EN" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await shot(page, "login-en-light-1440");
    await page.getByRole("button").nth(1).click();
    await shot(page, "login-en-dark-1440");
  });

  test("login 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard/login");
    await shot(page, "login-ar-light-390");
  });

  test("forgot password and locked and MFA states", async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.getByRole("button", { name: /نسيت|Forgot/i }).click();
    await expect(page.getByRole("heading", { name: /إعادة تعيين|Reset password/i })).toBeVisible();
    await shot(page, "login-ar-light-forgot-1440");
    await page.getByLabel(/البريد|Email/i).fill("nobody@example.com");
    await page.getByRole("button", { name: /إرسال|Send/i }).click();
    await expect(page.getByText(/إن وُجد|If the account/i)).toBeVisible();
    await shot(page, "login-ar-light-reset-sent-1440");

    await page.goto("/dashboard/login");
    await page.route("**/api/admin/login", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 423,
        contentType: "application/json",
        body: JSON.stringify({ message: "locked", minutes_remaining: 12 }),
      });
    });
    await page.getByLabel(/البريد|Email/i).fill("locked@example.com");
    await page.getByLabel(/كلمة المرور|Password/i).first().fill("wrong-password");
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByText(/12/)).toBeVisible();
    await shot(page, "login-ar-light-locked-1440");
    await page.unroute("**/api/admin/login");

    await page.route("**/api/admin/login", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ mfa_required: true }),
      });
    });
    await page.goto("/dashboard/login");
    await page.getByLabel(/البريد|Email/i).fill("mfa@example.com");
    await page.getByLabel(/كلمة المرور|Password/i).first().fill("Password12!");
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByRole("heading", { name: /رمز|Authenticator/i })).toBeVisible();
    await shot(page, "login-ar-light-mfa-1440");
  });

  test("reset and invite screens", async ({ page }) => {
    await page.goto("/dashboard/reset-password?token=expired&email=a@example.com");
    await shot(page, "reset-ar-light-1440");
    await page.goto("/dashboard/accept-invite?token=expired&email=a@example.com");
    await shot(page, "invite-ar-light-1440");
  });

  test("axe on login", async ({ page }) => {
    await page.goto("/dashboard/login");
    await axeClean(page);
  });

  test("revalidate rejects a wrong secret", async ({ request }) => {
    const response = await request.post("/cms/revalidate", {
      headers: { Authorization: "Bearer wrong-secret-value", "Content-Type": "application/json" },
      data: { tags: ["projects"] },
    });
    expect(response.status()).toBe(401);
  });

  test("revalidate rejects a bad body", async ({ request }) => {
    const response = await request.post("/cms/revalidate", {
      headers: { Authorization: `Bearer ${revalidationSecret}`, "Content-Type": "application/json" },
      data: { tags: ["NOT VALID"] },
    });
    expect(response.status()).toBe(422);
  });

  test("revalidate accepts allowlisted tags", async ({ request }) => {
    const response = await request.post("/cms/revalidate", {
      headers: { Authorization: `Bearer ${revalidationSecret}`, "Content-Type": "application/json" },
      data: { tags: ["projects", "home"] },
    });
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ revalidated: ["projects", "home"] });
  });
});

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("dashboard authenticated", () => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");

  test("login reaches the home screen", async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.getByLabel(/البريد|Email/i).fill(adminEmail as string);
    await page.getByLabel(/كلمة المرور|Password/i).first().fill(adminPassword as string);
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await shot(page, "home-ar-light-1440");
    await axeClean(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await shot(page, "home-ar-light-390");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole("button", { name: "EN" }).click();
    await shot(page, "home-en-light-1440");
    await page.goto("/dashboard/projects");
    await shot(page, "projects-ar-light-1440");
    await page.goto("/dashboard/users");
    await shot(page, "users-en-light-1440");
    await page.goto("/dashboard/media");
    await shot(page, "media-en-light-1440");
    await page.goto("/dashboard/activity");
    await shot(page, "activity-en-light-1440");
    await page.goto("/dashboard/profile");
    await shot(page, "profile-en-light-1440");
  });
});
