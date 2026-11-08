import { expect, test } from "@playwright/test";

test("llms.txt is Markdown with an H1 and links in both languages", async ({ request, baseURL }) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toMatch(/^# .+/m);
  expect(body).toContain(`](${baseURL}/en/projects)`);
  expect(body).toContain(`](${baseURL}/ar/projects)`);
});
