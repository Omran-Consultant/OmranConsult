import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SHOTS = path.join(process.cwd(), "..", "review-shots", "site-fixes-3");

const ROUTES = [
  { name: "home", path: "" },
  { name: "projects", path: "/projects" },
  { name: "project-detail", path: "/projects/king-saud-university-operation-and-maintenance-efficiency" },
  { name: "media", path: "/media" },
  { name: "about", path: "/about" },
  { name: "contact", path: "/contact" },
] as const;

const SURFACES = [
  { locale: "ar" as const, theme: "light" as const, width: 1440 },
  { locale: "ar" as const, theme: "light" as const, width: 390 },
  { locale: "ar" as const, theme: "dark" as const, width: 1440 },
  { locale: "ar" as const, theme: "dark" as const, width: 390 },
  { locale: "en" as const, theme: "light" as const, width: 1440 },
  { locale: "en" as const, theme: "dark" as const, width: 1440 },
];

test.describe("site-fixes-3 screenshots", () => {
  test.describe.configure({ timeout: 600_000 });

  test("home, projects, project detail, media, about, contact", async ({ page }) => {
    mkdirSync(SHOTS, { recursive: true });
    const origin = `http://localhost:${process.env.E2E_PORT ?? "3000"}`;

    for (const surface of SURFACES) {
      await page.setViewportSize({ width: surface.width, height: 900 });
      // Cookie wins over localStorage in theme-init-script / readClientThemePreference.
      await page.context().addCookies([{ name: "oc-theme", value: surface.theme, url: origin }]);
      await page.addInitScript((theme) => {
        localStorage.setItem("oc-theme", theme);
        document.cookie = `oc-theme=${theme};path=/;max-age=31536000;SameSite=Lax`;
      }, surface.theme);

      for (const route of ROUTES) {
        // load (not networkidle): contact/newsletter polling can keep the network busy indefinitely.
        await page.goto(`/${surface.locale}${route.path}`, { waitUntil: "load" });
        const isDark = await page.evaluate(() => document.documentElement.classList.contains("dark"));
        expect(isDark, `${route.name} theme`).toBe(surface.theme === "dark");

        await page.evaluate(async () => {
          document.querySelectorAll("img[loading=lazy]").forEach((img) => img.setAttribute("loading", "eager"));
          for (let y = 0; y < document.body.scrollHeight; y += 500) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
          await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
          window.scrollTo(0, 0);
          document.querySelectorAll("[data-reveal]").forEach((node) => node.setAttribute("data-revealed", ""));
        });

        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${route.name}-${surface.locale}-${surface.theme}-${surface.width}`).toBeLessThanOrEqual(0);

        await page.screenshot({
          fullPage: true,
          path: path.join(SHOTS, `${route.name}-${surface.locale}-${surface.theme}-${surface.width}.png`),
        });
      }
    }
  });
});
