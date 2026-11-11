import { expect, test, type ConsoleMessage } from "@playwright/test";

/** SITE_POLISH P5: no console error or warning on any public page, the 404 page included. */
const ROUTES = [
  "",
  "/about",
  "/services",
  "/projects",
  "/projects/cop16-technical-audit",
  "/projects/king-saud-university-operation-and-maintenance-efficiency",
  "/contact",
  "/media",
  "/media/omran-cop16-technical-audit",
] as const;

const NOT_FOUND = ["/does-not-exist", "/projects/not-a-real-project", "/media/not-a-real-article"] as const;

function collect(page: import("@playwright/test").Page): string[] {
  const problems: string[] = [];
  page.on("console", (message: ConsoleMessage) => {
    if (message.type() === "error" || message.type() === "warning") {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

async function settle(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
}

for (const locale of ["ar", "en"] as const) {
  for (const route of ROUTES) {
    test(`${locale}${route || "/"} logs no console error or warning`, async ({ page }) => {
      const problems = collect(page);
      const response = await page.goto(`/${locale}${route}`);
      expect(response?.status()).toBe(200);
      await settle(page);
      expect(problems).toEqual([]);
    });
  }

  for (const route of NOT_FOUND) {
    test(`${locale}${route} 404 logs nothing but its own status`, async ({ page }) => {
      const problems = collect(page);
      const response = await page.goto(`/${locale}${route}`);
      expect(response?.status()).toBe(404);
      await settle(page);
      // The browser reports the document's own 404 status; nothing else may appear.
      const url = `/${locale}${route}`;
      expect(problems.filter((line) => !(line.startsWith("error: Failed to load resource") && line.includes("404")))).toEqual([]);
      expect(problems.filter((line) => line.startsWith("error: Failed to load resource")).length).toBeLessThanOrEqual(1);
      expect(url).toBeTruthy();
    });
  }
}
