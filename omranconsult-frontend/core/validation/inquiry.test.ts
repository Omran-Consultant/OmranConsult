import assert from "node:assert/strict";
import test from "node:test";

import { isValidEmail, isValidSaudiMobile, normalizePhone } from "./inquiry.ts";

test("accepts Saudi mobile numbers in both server formats", () => {
  assert.equal(isValidSaudiMobile("0512345678"), true);
  assert.equal(isValidSaudiMobile("+966 51 234 5678"), true);
  assert.equal(isValidSaudiMobile("051-234-5678"), true);
});

test("rejects landlines and short numbers", () => {
  assert.equal(isValidSaudiMobile("0114999925"), false);
  assert.equal(isValidSaudiMobile("05123"), false);
  assert.equal(isValidSaudiMobile("+966114999925"), false);
});

test("normalises spaces and dashes", () => {
  assert.equal(normalizePhone(" 05 1-2 "), "0512");
});

test("checks the email shape", () => {
  assert.equal(isValidEmail(" name@company.com "), true);
  assert.equal(isValidEmail("name@company"), false);
});
