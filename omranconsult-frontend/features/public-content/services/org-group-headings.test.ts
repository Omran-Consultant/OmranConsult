import assert from "node:assert/strict";
import test from "node:test";

import { resolveOrgGroupHeading } from "./org-group-headings.ts";

test("resolveOrgGroupHeading never returns raw group keys", () => {
  assert.equal(resolveOrgGroupHeading(undefined, "board"), undefined);
  assert.equal(resolveOrgGroupHeading({}, "board_committees"), undefined);
  assert.equal(resolveOrgGroupHeading({ board: "   " }, "board"), undefined);
  assert.equal(resolveOrgGroupHeading({ board: "مجلس الإدارة" }, "board"), "مجلس الإدارة");
});
