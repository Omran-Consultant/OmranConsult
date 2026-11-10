import assert from "node:assert/strict";
import { test } from "node:test";

import { capabilityChips } from "./capability-chips.ts";

test("repeated titles appear once, even with different spacing", () => {
  assert.deepEqual(capabilityChips(["إدارة أوامر العمل", "إدارة  أوامر العمل ", "ب"]), ["إدارة أوامر العمل", "ب"]);
});

test("at most three chips, skipping empty titles", () => {
  assert.deepEqual(capabilityChips([undefined, "أ", "", "ب", "ج", "د"]), ["أ", "ب", "ج"]);
});
