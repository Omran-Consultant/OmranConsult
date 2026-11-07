import assert from "node:assert/strict";
import test from "node:test";

import { formatStatisticValue } from "./statistic-formatter.ts";

test("formats completed projects as 204+", () => {
  assert.equal(
    formatStatisticValue({ value: 204, suffix: "+", locale: "en" }),
    "204+",
  );
});

test("formats project volume as 15B+", () => {
  assert.equal(
    formatStatisticValue({
      value: 15,
      scale: "billion",
      suffix: "+",
      locale: "en",
    }),
    "15B+",
  );
});

test("formats employee count with thousands separators", () => {
  assert.equal(formatStatisticValue({ value: 4500, locale: "en" }), "4,500");
});

test("formats percentage with two decimals", () => {
  assert.equal(
    formatStatisticValue({
      value: 72.92,
      suffix: "%",
      locale: "en",
    }),
    "72.92%",
  );
});

test("keeps latin digits for arabic locale", () => {
  assert.equal(
    formatStatisticValue({ value: 10, suffix: "+", locale: "ar" }),
    "10+",
  );
});
