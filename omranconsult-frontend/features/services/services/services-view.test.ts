import assert from "node:assert/strict";
import test from "node:test";

import { splitColumns } from "./services-view.ts";

test("splits ten items into 1-5 and 6-10", () => {
  const [first, second] = splitColumns([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(first, [1, 2, 3, 4, 5]);
  assert.deepEqual(second, [6, 7, 8, 9, 10]);
});

test("keeps the extra item in the first column", () => {
  assert.deepEqual(splitColumns(["a", "b", "c"]), [["a", "b"], ["c"]]);
});
