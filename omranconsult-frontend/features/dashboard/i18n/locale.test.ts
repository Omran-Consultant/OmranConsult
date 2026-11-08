import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseDashboardLocale, safeDashboardNext } from "./locale.ts";

describe("dashboard locale", () => {
  it("defaults to Arabic", () => {
    assert.equal(parseDashboardLocale(null), "ar");
    assert.equal(parseDashboardLocale("en"), "en");
  });

  it("rejects open redirects", () => {
    assert.equal(safeDashboardNext("//evil.com"), "/dashboard");
    assert.equal(safeDashboardNext("https://evil.com"), "/dashboard");
    assert.equal(safeDashboardNext("/en"), "/dashboard");
    assert.equal(safeDashboardNext("/dashboard/users"), "/dashboard/users");
  });
});
