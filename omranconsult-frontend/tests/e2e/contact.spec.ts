import { expect, test } from "@playwright/test";

test("contact page shows the header, channels, form and photo in order", async ({ page }) => {
  await page.goto("/ar/contact");
  await expect(page.locator("h1")).toHaveText("لنبدأ الحديث عن مشروعك");
  const channels = page.getByRole("list", { name: "قنوات التواصل" });
  await expect(channels.locator('a[href^="tel:"]').first()).toHaveAttribute("dir", "ltr");
  await expect(channels.locator('a[href="mailto:info@omranconsult.com"]')).toBeVisible();
  await expect(page.getByLabel("نوع الخدمة").locator("option")).toHaveCount(6);
});

test("contact form validates, then posts source=contact and shows success", async ({ page }) => {
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/inquiries", async (route) => {
    body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "استلمنا طلبك، سنتواصل معك خلال يومي عمل" }) });
  });
  await page.goto("/ar/contact");
  const card = page.getByTestId("contact-form-card");
  const submit = card.getByRole("button", { name: "إرسال الطلب" });

  await submit.click();
  await expect(card.getByText("أدخل اسمك")).toBeVisible();
  await expect(card.getByText("يلزم الموافقة لإرسال الطلب")).toBeVisible();
  await expect(card.getByLabel("الاسم الكامل")).toBeFocused();
  expect(body).toBeUndefined();

  await card.getByLabel("الاسم الكامل").fill("مهندس تجربة");
  await card.getByLabel("البريد الإلكتروني").fill("test@example.com");
  await card.getByLabel("رقم الجوال").fill("0114999925");
  await submit.click();
  await expect(card.getByText("أدخل رقم جوال سعودياً صحيحاً مثل 05XXXXXXXX")).toBeVisible();

  await card.getByLabel("رقم الجوال").fill("05 1234 5678");
  await card.getByLabel("نوع الخدمة").selectOption("asset-management-services");
  await card.getByLabel("تفاصيل المشروع").fill("تقييم أصول مبنى إداري");
  await card.getByLabel(/أوافق على سياسة الخصوصية/).check();
  await submit.click();

  await expect(card.getByRole("status")).toHaveText("استلمنا طلبك، سنتواصل معك خلال يومي عمل");
  expect(body).toEqual({
    source: "contact",
    name: "مهندس تجربة",
    email: "test@example.com",
    phone: "0512345678",
    service_type: "asset-management-services",
    message: "تقييم أصول مبنى إداري",
    consent: true,
    website: "",
  });
});

test("contact form maps server validation and rate limits to localized messages", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/inquiries", async (route) => {
    calls += 1;
    if (calls === 1) {
      await route.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ message: "x", errors: { email: ["The email field must be a valid email address."] } }) });
      return;
    }
    await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ message: "Too Many Attempts." }) });
  });
  await page.goto("/en/contact");
  const card = page.getByTestId("contact-form-card");
  await card.getByLabel("Full name").fill("Test engineer");
  await card.getByLabel("Email").fill("test@example.com");
  await card.getByLabel(/I agree to the privacy policy/).check();
  await card.getByRole("button", { name: "Send request" }).click();
  await expect(card.getByText("Enter a valid email address")).toBeVisible();
  await expect(card.getByText("We could not send your request. Please try again.")).toBeVisible();

  await card.getByLabel("Email").fill("other@example.com");
  await card.getByRole("button", { name: "Send request" }).click();
  await expect(card.getByText("Too many attempts. Wait a minute and try again.")).toBeVisible();
  await expect(page.getByText("Too Many Attempts.", { exact: true })).toHaveCount(0);
});

test("footer newsletter subscribes and announces the server message", { tag: "@desktop" }, async ({ page }) => {
  let body: Record<string, unknown> | undefined;
  await page.route("**/api/newsletter", async (route) => {
    body = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "تم الاشتراك في النشرة" }) });
  });
  await page.goto("/ar/contact");
  const footer = page.locator("footer");
  await footer.getByLabel("البريد الإلكتروني").fill("reader@example.com");
  await footer.getByRole("button", { name: "اشترك" }).click();
  await expect(footer.getByText("تم الاشتراك في النشرة")).toBeVisible();
  expect(body).toEqual({ email: "reader@example.com", consent: true });
});

test("contact and newsletter forms send only one request on a double submit", { tag: "@desktop" }, async ({ page }) => {
  let inquiryCalls = 0;
  let releaseInquiry: (() => void) | undefined;
  const inquiryGate = new Promise<void>((resolve) => {
    releaseInquiry = resolve;
  });
  await page.route("**/api/inquiries", async (route) => {
    inquiryCalls += 1;
    await inquiryGate;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "Received" }) });
  });

  await page.goto("/en/contact");
  const card = page.getByTestId("contact-form-card");
  await card.getByLabel("Full name").fill("Test engineer");
  await card.getByLabel("Email").fill("test@example.com");
  await card.getByLabel(/I agree to the privacy policy/).check();
  await card.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect.poll(() => inquiryCalls).toBe(1);
  releaseInquiry?.();
  await expect(card.getByRole("status")).toBeVisible();

  let newsletterCalls = 0;
  let releaseNewsletter: (() => void) | undefined;
  const newsletterGate = new Promise<void>((resolve) => {
    releaseNewsletter = resolve;
  });
  await page.route("**/api/newsletter", async (route) => {
    newsletterCalls += 1;
    await newsletterGate;
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "Subscribed" }) });
  });

  const footer = page.locator("footer");
  await footer.getByLabel("Email").fill("reader@example.com");
  await footer.locator("form").evaluate((form: HTMLFormElement) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await expect.poll(() => newsletterCalls).toBe(1);
  releaseNewsletter?.();
  await expect(footer.getByText("Subscribed")).toBeVisible();
});
