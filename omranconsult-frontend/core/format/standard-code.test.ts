import assert from "node:assert/strict";
import test from "node:test";

import { shortStandardCode } from "./standard-code.ts";

test("drops the edition year only", () => {
  assert.equal(shortStandardCode("ISO/IEC 27001:2022"), "ISO/IEC 27001");
  assert.equal(shortStandardCode("ISO 9001:2015"), "ISO 9001");
  assert.equal(shortStandardCode("ISO 55001"), "ISO 55001");
});
