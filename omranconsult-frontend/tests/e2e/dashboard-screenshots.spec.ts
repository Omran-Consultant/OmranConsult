import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  captureReady,
  DASHBOARD_SHOTS,
  editorCredentials,
  loginToDashboard,
  logoutDashboard,
  setDashboardSurface,
  SURFACE_LOCALES,
  SURFACE_THEMES,
  SURFACE_WIDTHS,
  waitReady,
} from "./dashboard-helpers";

test.describe("dashboard screenshots", () => {
  test.describe.configure({ timeout: 600_000 });

  test("login states across locales, themes, and widths", async ({ page }) => {
    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          await page.goto("/dashboard/login");
          await captureReady(page, `login-${locale}-${theme}-${width}`);

          await page.locator("#email").fill("nobody@example.com");
          await page.locator("#password").fill("wrong-password");
          await page.getByRole("button", { name: /دخول|Sign in/i }).click();
          await expect(page.getByText(/غير صحيحة|incorrect/i)).toBeVisible();
          await captureReady(page, `login-invalid-${locale}-${theme}-${width}`);

          await page.goto("/dashboard/login");
          await page.getByRole("button", { name: /نسيت|Forgot/i }).click();
          await expect(page.getByRole("heading", { name: /إعادة تعيين|Reset password/i })).toBeVisible();
          await captureReady(page, `login-forgot-${locale}-${theme}-${width}`);
          await page.locator("#forgot-email").fill("nobody@example.com");
          await page.getByRole("button", { name: /إرسال|Send/i }).click();
          await expect(page.getByText(/إن وُجد|If the account/i)).toBeVisible();
          await captureReady(page, `login-reset-sent-${locale}-${theme}-${width}`);

          await page.goto("/dashboard/reset-password?token=expired&email=a@example.com");
          await captureReady(page, `reset-${locale}-${theme}-${width}`);
          await page.goto("/dashboard/accept-invite?token=expired&email=a@example.com");
          await captureReady(page, `invite-${locale}-${theme}-${width}`);
        }
      }
    }
  });

  test("authenticated 5A screens with real content", async ({ page }) => {
    await loginToDashboard(page);
    const pages = [
      { href: "/dashboard", name: "home" },
      { href: "/dashboard/projects", name: "projects" },
      { href: "/dashboard/users", name: "users" },
      { href: "/dashboard/profile", name: "profile" },
      { href: "/dashboard/activity", name: "activity" },
      { href: "/dashboard/media", name: "media" },
    ] as const;

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          for (const item of pages) {
            await page.goto(item.href);
            await captureReady(page, `${item.name}-${locale}-${theme}-${width}`);
            if (width === 1440) {
              await axeClean(page);
            }
          }
        }
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/dashboard/projects");
    await waitReady(page);
    const published = page.locator("a[data-status='published'], a[data-status='published_with_draft']").first();
    await published.click();
    await waitReady(page);
    const original = await page.locator("#title-ar").inputValue();
    await page.locator("#title-ar").fill(`${original} مسودة`);
    await page.getByRole("button", { name: /حفظ المسودة|Save draft/i }).click();
    await expect(page.locator("[data-draft-badge]")).toBeVisible();
    const editorUrl = page.url();

    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          await page.goto(editorUrl);
          await captureReady(page, `project-edit-draft-${locale}-${theme}-${width}`);
        }
      }
    }

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", { name: /معاينة|Preview/i }).click();
    const preview = await popupPromise;
    await preview.waitForLoadState("domcontentloaded");
    await expect(preview.locator("[data-preview-banner]")).toBeVisible();
    const previewLocale = preview.url().includes("/en/") ? "en" : "ar";
    for (const theme of SURFACE_THEMES) {
      for (const width of SURFACE_WIDTHS) {
        await preview.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
        await preview.evaluate((next) => {
          localStorage.setItem("oc-theme", next);
          document.documentElement.classList.toggle("dark", next === "dark");
        }, theme);
        await captureReady(preview, `preview-banner-${previewLocale}-${theme}-${width}`);
      }
    }
    await preview.close();

    await page.goto(editorUrl);
    await waitReady(page);
    await page.getByRole("button", { name: /تجاهل التعديلات|Discard/i }).click();

    await page.goto("/dashboard/media");
    await waitReady(page);
    await page.locator("ul button").first().click();
    await expect(page.locator("[data-media-details]")).toBeVisible();
    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          await page.goto("/dashboard/media");
          await waitReady(page);
          await page.locator("ul button").first().click();
          await expect(page.locator("[data-media-details]")).toBeVisible();
          await captureReady(page, `media-details-${locale}-${theme}-${width}`);
        }
      }
    }

    await page.goto("/dashboard/profile");
    await waitReady(page);
    await page.getByRole("button", { name: /تفعيل التطبيق|Enable authenticator/i }).click();
    await expect(page.locator("[data-mfa-secret]")).toBeVisible();
    for (const width of SURFACE_WIDTHS) {
      for (const theme of SURFACE_THEMES) {
        await setDashboardSurface(page, "ar", theme, width);
        await page.evaluate((next) => {
          localStorage.setItem("oc-theme", next);
          document.documentElement.classList.toggle("dark", next === "dark");
        }, theme);
        await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });
        await captureReady(page, `profile-mfa-setup-ar-${theme}-${width}`);
      }
    }

    await logoutDashboard(page);
    const editor = editorCredentials();
    await loginToDashboard(page, editor.email, editor.password);
    for (const locale of SURFACE_LOCALES) {
      for (const theme of SURFACE_THEMES) {
        for (const width of SURFACE_WIDTHS) {
          await setDashboardSurface(page, locale, theme, width);
          await page.goto("/dashboard/users");
          await captureReady(page, `no-permission-${locale}-${theme}-${width}`);
        }
      }
    }
  });

  test("login compare concept B versus implementation", async ({ page }) => {
    await setDashboardSurface(page, "ar", "light", 1440);
    await page.goto("/dashboard/login");
    await waitReady(page);
    const implementation = await page.screenshot({ type: "png" });
    const concept = readFileSync(
      path.join(process.cwd(), "..", "docs", "design-reference", "concepts", "login-B-desktop.png"),
    );
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#111;display:flex">
      <img alt="concept" src="data:image/png;base64,${concept.toString("base64")}" style="width:50%;object-fit:contain">
      <img alt="implementation" src="data:image/png;base64,${implementation.toString("base64")}" style="width:50%;object-fit:contain">
    </body></html>`);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: path.join(DASHBOARD_SHOTS, "login-compare-ar-light-1440.png"),
      fullPage: true,
    });
  });
});

async function axeClean(page: Page) {
  const axe = await new AxeBuilder({ page }).analyze();
  const severe = axe.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  expect(severe).toEqual([]);
}
