import assert from "node:assert/strict";
import test from "node:test";

import { annularSectorPath } from "./annular-sector.ts";

test("draws the outer arc clockwise and the inner arc back", () => {
  // Quarter ring from 3 o'clock to 6 o'clock in a 100 box, inner radius 50 %.
  assert.equal(annularSectorPath(100, 0, Math.PI / 2, 0.5), "M 100 50 A 50 50 0 0 1 50 100 L 50 75 A 25 25 0 0 0 75 50 Z");
});

test("uses the large-arc flag for sweeps over 180 degrees", () => {
  const path = annularSectorPath(1180, -1.2, 3.6, 0.8);
  assert.match(path, /A 590 590 0 1 1/);
  assert.match(path, /A 472 472 0 1 0/);
});
