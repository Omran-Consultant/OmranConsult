import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

import { artisan } from "./artisan";
import {
  adminCredentials,
  deactivateUserByEmail,
  editorCredentials,
  inviteAndAccept,
  loginAs,
  loginToDashboard,
  logoutDashboard,
  spoofedSvgAsJpeg,
  uniqueTestEmail,
  validJpegUpload,
  waitReady,
} from "./dashboard-helpers";
import { generateTotp } from "./totp";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "dashboard", "5A");
const revalidationSecret = process.env.REVALIDATION_SECRET || "playwright-revalidate-secret";
const throwawayPassword = "ThrowPass12!";

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
    const { email, password } = adminCredentials();
    await page.goto("/dashboard/projects");
    await page.waitForURL(/\/dashboard\/login/);
    expect(page.url()).toContain("next=");
    await page.goto("/dashboard/login?next=//evil.com");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await page.waitForURL((url) => url.pathname === "/dashboard");
    expect(page.url()).not.toMatch(/evil\.com/);
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

  test("invalid credentials, forgot password, reset and invite screens", async ({ page }) => {
    await page.goto("/dashboard/login");
    await page.locator("#email").fill("nobody@example.com");
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByText(/غير صحيحة|incorrect/i)).toBeVisible();
    await shot(page, "login-ar-light-invalid-1440");

    await page.goto("/dashboard/login");
    await page.getByRole("button", { name: /نسيت|Forgot/i }).click();
    await expect(page.getByRole("heading", { name: /إعادة تعيين|Reset password/i })).toBeVisible();
    await shot(page, "login-ar-light-forgot-1440");
    await page.getByLabel(/البريد|Email/i).fill("nobody@example.com");
    await page.getByRole("button", { name: /إرسال|Send/i }).click();
    await expect(page.getByText(/إن وُجد|If the account/i)).toBeVisible();
    await shot(page, "login-ar-light-reset-sent-1440");

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

test.describe("dashboard authenticated", () => {
  test.describe.configure({ timeout: 90_000 });

  test("login → home KPIs match the summary API", async ({ page }) => {
    await loginToDashboard(page);
    const summary = await page.evaluate(async () => {
      const response = await fetch("/api/admin/dashboard/summary", { credentials: "include" });
      return response.json();
    });
    await expect(page.locator('[data-kpi="projects"]')).toHaveText(
      `${summary.kpis.projects_published} / ${summary.kpis.projects_draft}`,
    );
    await expect(page.locator('[data-kpi="drafts"]')).toHaveText(String(summary.kpis.drafts_awaiting_publish));
    await shot(page, "home-ar-light-1440");
    await axeClean(page);
  });

  test("invite → accept → login as the new user", async ({ page }) => {
    const email = uniqueTestEmail("e2e-invite");
    await inviteAndAccept(page, "E2E Invitee", email, throwawayPassword);
    await loginToDashboard(page, email, throwawayPassword);
    await expect(page.getByRole("link", { name: /المستخدمون|Users/ })).toHaveCount(0);
    await deactivateUserByEmail(page, email);
  });

  test("MFA enable, TOTP login, recovery login, reused recovery rejected", async ({ page }) => {
    const email = uniqueTestEmail("e2e-mfa");
    await inviteAndAccept(page, "E2E MFA", email, throwawayPassword);
    await loginToDashboard(page, email, throwawayPassword);
    await page.goto("/dashboard/profile");
    await waitReady(page);
    await page.getByRole("button", { name: /تفعيل التطبيق|Enable authenticator/i }).click();
    const secret = (await page.locator("[data-mfa-secret]").innerText()).trim();
    expect(secret.length).toBeGreaterThan(10);
    await page.getByLabel(/رمز من 6 أرقام|Authenticator code|6-digit code/i).fill(generateTotp(secret));
    await page.getByRole("button", { name: /^تأكيد$|^Confirm$/ }).click();
    const recovery = (await page.locator("[data-recovery-codes] li").first().innerText()).trim();
    expect(recovery.length).toBeGreaterThan(4);
    await logoutDashboard(page);

    await loginAs(page, email, throwawayPassword);
    await expect(page.getByRole("heading", { name: /رمز|Authenticator/i })).toBeVisible();
    await shot(page, "login-ar-light-mfa-1440");
    await page.getByLabel(/رمز من 6 أرقام|6-digit code/i).fill(generateTotp(secret));
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await page.waitForURL((url) => url.pathname === "/dashboard");
    await logoutDashboard(page);

    await loginAs(page, email, throwawayPassword);
    await page.getByRole("button", { name: /رمز استرداد|recovery code/i }).click();
    await page.getByLabel(/رمز الاسترداد|Recovery code/i).fill(recovery);
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await page.waitForURL((url) => url.pathname === "/dashboard");
    await logoutDashboard(page);

    await loginAs(page, email, throwawayPassword);
    await page.getByRole("button", { name: /رمز استرداد|recovery code/i }).click();
    await page.getByLabel(/رمز الاسترداد|Recovery code/i).fill(recovery);
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByText(/غير صحيح|not valid/i)).toBeVisible();

    await deactivateUserByEmail(page, email);
  });

  test("five wrong passwords lock a throwaway user with 423", async ({ page }) => {
    const email = uniqueTestEmail("e2e-lockout");
    await inviteAndAccept(page, "E2E Lockout", email, throwawayPassword);
    await page.goto("/dashboard/login");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.locator("#email").fill(email);
      await page.locator("#password").fill("wrong-password");
      await page.getByRole("button", { name: /دخول|Sign in/i }).click();
      if (attempt < 4) {
        await expect(page.getByText(/غير صحيحة|incorrect/i)).toBeVisible();
      }
    }
    await expect(page.getByText(/دقيقة|minutes/i)).toBeVisible();
    await shot(page, "login-ar-light-locked-1440");
    artisan(["cache:clear"]);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(throwawayPassword);
    await page.getByRole("button", { name: /دخول|Sign in/i }).click();
    await expect(page.getByText(/دقيقة|minutes/i)).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard\/login/);
    await deactivateUserByEmail(page, email);
  });

  test("draft preview publish then restore the original title", async ({ page }) => {
    await loginToDashboard(page);
    await page.goto("/dashboard/projects");
    await waitReady(page);
    const project = page.locator("a[data-status='published'], a[data-status='published_with_draft']").first();
    await expect(project).toBeVisible();
    const slug = (await project.getAttribute("data-slug")) ?? "";
    const projectId = (await project.getAttribute("data-project-id")) ?? "";
    await project.click();
    await waitReady(page);
    const titleInput = page.locator("#title-ar");
    const original = await titleInput.inputValue();
    const draftTitle = `${original} مسودة-e2e`;
    await titleInput.fill(draftTitle);
    await page.getByRole("button", { name: /حفظ المسودة|Save draft/i }).click();
    await expect(page.locator("[data-draft-badge]")).toBeVisible();

    await page.goto(`/ar/projects/${slug}`);
    await expect(page.getByRole("heading").first()).toContainText(original);
    await expect(page.getByRole("heading").first()).not.toContainText("مسودة-e2e");

    await page.goto(`/dashboard/projects/${projectId}`);
    await waitReady(page);
    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /معاينة|Preview/i }).click();
    const preview = await popupPromise;
    await preview.waitForLoadState("domcontentloaded");
    await expect(preview.locator("[data-preview-banner]")).toBeVisible();
    await expect(preview.getByRole("heading").first()).toContainText("مسودة-e2e");
    await preview.close();

    await page.getByRole("button", { name: /نشر التعديلات|Publish/i }).click();
    await expect(page.getByText(/نُشر|Published/i)).toBeVisible();
    artisan(["queue:work", "--stop-when-empty", "--tries=1"]);
    await page.goto(`/ar/projects/${slug}`);
    await expect(page.getByRole("heading").first()).toContainText("مسودة-e2e");

    await page.goto("/dashboard/projects");
    await waitReady(page);
    await page.locator(`a[data-slug="${slug}"]`).click();
    await waitReady(page);
    await page.locator("#title-ar").fill(original);
    await page.getByRole("button", { name: /حفظ المسودة|Save draft/i }).click();
    await page.getByRole("button", { name: /نشر التعديلات|Publish/i }).click();
    await expect(page.getByText(/نُشر|Published/i)).toBeVisible();
    artisan(["queue:work", "--stop-when-empty", "--tries=1"]);
    await page.goto(`/ar/projects/${slug}`);
    await expect(page.getByRole("heading").first()).toContainText(original);
    await expect(page.getByRole("heading").first()).not.toContainText("مسودة-e2e");
  });

  test("editor cannot open admin screens and the users API returns 403", async ({ page }) => {
    const editor = editorCredentials();
    await loginToDashboard(page, editor.email, editor.password);
    await expect(page.getByRole("navigation").getByRole("link", { name: /المستخدمون|Users/ })).toHaveCount(0);
    await expect(page.getByRole("navigation").getByRole("link", { name: /الإعدادات|Settings/ })).toHaveCount(0);
    await expect(page.getByRole("navigation").getByRole("link", { name: /سجل النشاط|Activity log/ })).toHaveCount(0);
    const forbiddenStatus = await page.evaluate(async () => {
      const response = await fetch("/api/admin/users", { credentials: "include" });
      return response.status;
    });
    expect(forbiddenStatus).toBe(403);
    await page.goto("/dashboard/users");
    await expect(page.getByRole("heading", { name: /لا تملك صلاحية|do not have permission/i })).toBeVisible();
    await shot(page, "no-permission-ar-light-1440");
  });

  test("media accepts a JPEG and rejects a renamed SVG", async ({ page }) => {
    await loginToDashboard(page);
    await page.goto("/dashboard/media");
    await waitReady(page);
    await page.locator('input[type="file"]').setInputFiles(validJpegUpload());
    await expect(page.getByText("e2e-valid.jpg")).toBeVisible({ timeout: 20_000 });
    await page.locator('input[type="file"]').setInputFiles(spoofedSvgAsJpeg());
    await expect(page.getByText(/SVG/i)).toBeVisible();
    await page.getByText("e2e-valid.jpg").click();
    await expect(page.locator("[data-media-details]")).toBeVisible();
    await page.getByRole("button", { name: /حذف قسري|Force delete/i }).click();
  });

  test("sidebar stays on the inline-start edge in Arabic and English, including while loading", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.route("**/api/admin/me", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });
    const { email, password } = adminCredentials();
    await loginAs(page, email, password);
    await page.waitForURL(/\/dashboard/);
    const loading = page.locator("[data-dashboard-loading] [data-sidebar]");
    await expect(loading).toBeVisible({ timeout: 10_000 });
    await assertSidebarStart(page, "ar");
    await page.unroute("**/api/admin/me");
    await waitReady(page);

    for (const href of ["/dashboard", "/dashboard/projects", "/dashboard/users"]) {
      await page.goto(href);
      await waitReady(page);
      await assertSidebarStart(page, "ar");
    }

    await page.getByRole("button", { name: "EN" }).click();
    await waitReady(page);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await assertSidebarStart(page, "en");
    await page.goto("/dashboard/projects");
    await waitReady(page);
    await assertSidebarStart(page, "en");
  });
});

async function assertSidebarStart(page: Page, locale: "ar" | "en") {
  const box = await page.locator("[data-sidebar]").boundingBox();
  expect(box).toBeTruthy();
  const width = page.viewportSize()?.width ?? 1440;
  if (locale === "ar") {
    expect(box!.x).toBeGreaterThan(width / 2);
  } else {
    expect(box!.x).toBeLessThan(width / 2);
  }
}
