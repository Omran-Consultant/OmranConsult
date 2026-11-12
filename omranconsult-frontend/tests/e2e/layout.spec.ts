import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, traps focus, closes on Escape and restores focus", async ({ page }) => {
    await page.goto("/ar");
    const toggle = page.getByRole("button", { name: "فتح القائمة" });
    await toggle.click();

    const dialog = page.getByRole("dialog", { name: "القائمة" });
    await expect(dialog).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "إغلاق القائمة" })).toBeFocused();
    await expect(dialog.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");

    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("open menu has no serious axe violations", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(500);
    const axe = await new AxeBuilder({ page }).include("#mobile-menu").analyze();
    expect(axe.violations.filter((v) => ["critical", "serious"].includes(v.impact ?? ""))).toEqual([]);
  });
});

test("desktop header marks the active link and links to contact", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/en/about");
  const nav = page.getByRole("navigation", { name: "Main navigation" });
  await expect(nav.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("header").getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/en/contact");
});

test("language switch keeps the path", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/en/services");
  await page.locator("header").getByRole("link", { name: "ع" }).click();
  await expect(page).toHaveURL(/\/ar\/services$/);
});

test("light is the default and the theme toggle persists dark mode", { tag: "@desktop" }, async ({ page }) => {
  const initialResponse = await page.request.get("/en");
  expect(await initialResponse.text()).not.toMatch(/<html[^>]*class="[^"]*\bdark\b/);

  await page.goto("/en");
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible();
});

for (const locale of ["en", "ar"] as const) {
  test(`${locale} unknown path renders the localized 404`, async ({ page }) => {
    const response = await page.goto(`/${locale}/does-not-exist`);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText(locale === "ar" ? "الصفحة غير موجودة" : "Page not found");
    await expect(page.getByRole("link", { name: locale === "ar" ? "العودة إلى الرئيسية" : "Back to home" })).toBeVisible();
  });
}

test("footer newsletter validates the email before sending", { tag: "@desktop" }, async ({ page }) => {
  await page.goto("/en");
  const footer = page.locator("footer");
  await footer.getByLabel("Email").fill("not-an-email");
  await footer.getByRole("button", { name: "Subscribe" }).click();
  await expect(footer.getByText("Enter a valid email address")).toBeVisible();
  await expect(footer.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
});

/** D2: logo and column headings share one top line; the gap above the columns equals the gap below. */
function footerMetrics() {
  const footer = document.querySelector<HTMLElement>('footer[data-section="footer"]');
  const grid = footer?.querySelector<HTMLElement>(".grid");
  const logo = footer?.querySelector<HTMLElement>("a img, a svg");
  if (!footer || !grid || !logo) {
    return null;
  }
  const headings = [...footer.querySelectorAll<HTMLElement>("h2")].filter((heading) => heading.offsetParent);
  const top = (el: Element) => el.getBoundingClientRect().top + scrollY;
  // The visible edge above the columns: the footer top, or the last content when the section above shares its surface.
  const main = document.querySelector("main");
  const last = main?.lastElementChild;
  const sameSurface = last && getComputedStyle(last).backgroundColor === getComputedStyle(footer).backgroundColor;
  let edge = top(footer);
  if (sameSurface && last) {
    edge = Math.max(...[...last.querySelectorAll("*")].filter((el) => el.children.length === 0).map((el) => el.getBoundingClientRect().bottom + scrollY));
  }
  const gridBottom = grid.getBoundingClientRect().bottom + scrollY;
  const mark = [...footer.querySelectorAll<HTMLElement>("p")].find((p) => p.textContent?.trim() === "OMRAN" && p.offsetParent);
  let below: number;
  if (mark) {
    const style = getComputedStyle(mark);
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) {
      return null;
    }
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics = ctx.measureText("OMRAN");
    const content = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
    const baseline = top(mark) + (parseFloat(style.lineHeight) - content) / 2 + metrics.fontBoundingBoxAscent;
    below = baseline - metrics.actualBoundingBoxAscent - gridBottom;
  } else {
    const bar = footer.querySelector<HTMLElement>(".border-t");
    below = (bar ? top(bar) : 0) - gridBottom;
  }
  return {
    logoTop: top(logo),
    headingTops: headings.map(top),
    above: top(grid) - edge,
    below,
  };
}

for (const width of [1440, 390]) {
  for (const locale of ["ar", "en"]) {
    for (const path of ["", "/about", "/projects", "/media", "/contact"]) {
      test(`footer is aligned and balanced on /${locale}${path} at ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/${locale}${path}`);
        await page.locator("footer").scrollIntoViewIfNeeded();
        // Sections stream in and reveal on scroll; measure once the layout has settled.
        await expect.poll(async () => {
          const settled = await page.evaluate(footerMetrics);
          return settled ? Math.abs(settled.above - settled.below) : Infinity;
        }).toBeLessThanOrEqual(8);
        const m = await page.evaluate(footerMetrics);
        expect(m).not.toBeNull();
        if (!m) {
          return;
        }
        for (const headingTop of m.headingTops) {
          // Desktop: one top line with the logo. Mobile: the two columns share a line below the logo.
          expect(Math.abs(headingTop - (width >= 1024 ? m.logoTop : (m.headingTops[0] ?? 0)))).toBeLessThanOrEqual(1);
        }
      });
    }
  }
}
