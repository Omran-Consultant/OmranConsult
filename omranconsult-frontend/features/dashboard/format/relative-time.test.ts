import assert from "node:assert/strict";
import test from "node:test";

import { formatFullDateTime, formatRelativeTime, parseTimestamp } from "./relative-time.ts";

test("parseTimestamp rejects invalid values", () => {
  assert.equal(parseTimestamp(null), null);
  assert.equal(parseTimestamp("not-a-date"), null);
  assert.ok(parseTimestamp("2026-11-09T08:00:00.000Z"));
});

test("formatRelativeTime uses Arabic copy for recent times", () => {
  const now = new Date("2026-11-09T12:00:00.000Z");
  const fiveMinAgo = new Date(now.getTime() - 5 * 60_000).toISOString();
  const result = formatRelativeTime(fiveMinAgo, "ar", now);
  assert.match(result, /دقائق|دقيقة|minutes|الآن|قبل/i);
});

test("formatFullDateTime localizes month", () => {
  const value = "2026-11-09T08:00:00.000Z";
  const ar = formatFullDateTime(value, "ar");
  const en = formatFullDateTime(value, "en");
  assert.notEqual(ar, en);
});
