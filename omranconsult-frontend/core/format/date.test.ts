import assert from "node:assert/strict";
import test from "node:test";

import { formatMonthYear, formatYear } from "./date.ts";

test("formats month and year with the Gregorian calendar and Latin digits", () => {
  assert.equal(formatMonthYear("2024-12-01", "ar"), "ديسمبر 2024");
  assert.equal(formatMonthYear("2024-12-01", "en"), "December 2024");
});

test("returns undefined for missing or malformed dates", () => {
  assert.equal(formatMonthYear(undefined, "ar"), undefined);
  assert.equal(formatMonthYear("12/2024", "en"), undefined);
  assert.equal(formatYear("not-a-date"), undefined);
});

test("extracts the year", () => {
  assert.equal(formatYear("2025-06-01"), "2025");
});
