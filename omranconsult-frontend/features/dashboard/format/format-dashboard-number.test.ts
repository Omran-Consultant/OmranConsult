import assert from "node:assert/strict";
import test from "node:test";

import { formatDashboardNumber } from "./format-dashboard-number.ts";

test("formatDashboardNumber uses Arabic digits in ar", () => {
  assert.match(formatDashboardNumber(26, "ar"), /[٠-٩]/);
  assert.equal(formatDashboardNumber(26, "en"), "26");
});
