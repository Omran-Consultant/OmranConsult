import { expect, test } from "@playwright/test";

// The suite runs without SITE_INDEXABLE, which is the preview/local mode: nothing is indexable.
test("non-indexable hosts send X-Robots-Tag noindex on pages", async ({ request }) => {
  for (const path of ["/en", "/ar", "/en/projects"]) {
    const response = await request.get(path);
    expect(response.headers()["x-robots-tag"], path).toBe("noindex, nofollow");
  }
});

test("non-indexable hosts serve a disallow-all robots.txt", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toContain("Disallow: /");
  expect(body).not.toContain("Allow: /\n");
  expect(body).not.toContain("Sitemap:");
});

test("canonical and hreflang use the configured site origin", async ({ page, baseURL }) => {
  await page.goto("/ar");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}/ar`);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `${baseURL}/en`);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", `${baseURL}/en`);
});

for (const route of ["/about", "/services", "/projects", "/contact", "/media", "/projects/cop16-technical-audit"]) {
  test(`${route} is canonical to itself, not to Home`, async ({ page, baseURL }) => {
    await page.goto(`/en${route}`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${baseURL}/en${route}`);
    await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", `${baseURL}/ar${route}`);
  });
}
