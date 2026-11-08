import assert from "node:assert/strict";
import test from "node:test";

import { expertGroup, filterExperts } from "./expert-groups.ts";

const experts = [
  { slug: "mohammed-mosaad" },
  { slug: "waseem-asfahan" },
  { slug: "abdulrahman-al-muqbil" },
  { slug: "future-expert" },
];

test("groups the seeded experts by their profile titles", () => {
  assert.equal(expertGroup("amira-al-burtuqali"), "design");
  assert.equal(expertGroup("waseem-asfahan"), "quality");
  assert.equal(expertGroup("abdulrahman-al-muqbil"), "data");
  assert.equal(expertGroup("future-expert"), undefined);
});

test("an unknown specialty stays in All and is hidden from a group", () => {
  assert.deepEqual(
    filterExperts(experts, undefined).map((expert) => expert.slug),
    ["mohammed-mosaad", "waseem-asfahan", "abdulrahman-al-muqbil", "future-expert"],
  );
  assert.deepEqual(
    filterExperts(experts, "data").map((expert) => expert.slug),
    ["abdulrahman-al-muqbil"],
  );
});
