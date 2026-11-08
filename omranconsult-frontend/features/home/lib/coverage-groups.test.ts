import assert from "node:assert/strict";
import test from "node:test";

import { COVERAGE_GROUPS, groupRegions } from "./coverage-groups.ts";

const API_REGIONS = ["northern-region", "tabuk", "al-qassim", "madinah", "riyadh", "eastern-province", "makkah", "al-baha", "asir", "jazan", "najran"];

test("every API region belongs to exactly one macro region", () => {
  const assigned = COVERAGE_GROUPS.flatMap((group) => [...group.regions]);
  assert.deepEqual([...assigned].sort(), [...API_REGIONS].sort());
  assert.equal(new Set(assigned).size, assigned.length);
});

test("groups keep the design order and drop unknown or empty groups", () => {
  const groups = groupRegions([
    { slug: "riyadh", name: "الرياض" },
    { slug: "al-qassim", name: "منطقة القصيم" },
    { slug: "jazan", name: "جازان" },
  ]);
  assert.deepEqual(groups, [
    { key: "central", regions: ["الرياض", "منطقة القصيم"] },
    { key: "southern", regions: ["جازان"] },
  ]);
});
