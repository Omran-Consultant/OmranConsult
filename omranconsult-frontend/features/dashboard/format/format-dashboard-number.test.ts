import assert from "node:assert/strict";
import test from "node:test";

import { formatDashboardNumber, formatDashboardPercent } from "./format-dashboard-number.ts";

const ARABIC_INDIC = /[٠-٩۰-۹]/;

test("formatDashboardNumber uses Western digits in Arabic and English", () => {
  assert.equal(formatDashboardNumber(26, "ar"), "26");
  assert.equal(formatDashboardNumber(26, "en"), "26");
  assert.equal(formatDashboardNumber(0, "ar"), "0");
  assert.doesNotMatch(formatDashboardNumber(15, "ar"), ARABIC_INDIC);
});

test("formatDashboardPercent uses Western digits and a percent sign", () => {
  assert.equal(formatDashboardPercent(15, "ar"), "15%");
  assert.equal(formatDashboardPercent(4, "en"), "4%");
  assert.doesNotMatch(formatDashboardPercent(100, "ar"), ARABIC_INDIC);
});
