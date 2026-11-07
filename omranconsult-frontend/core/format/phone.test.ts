import assert from "node:assert/strict";
import test from "node:test";

import { formatPhoneForDisplay, formatPhoneTelLink } from "./phone.ts";

test("formatPhoneForDisplay spaces Saudi numbers like the footer", () => {
  assert.equal(formatPhoneForDisplay("+966114999925"), "+966 11 499 9925");
  assert.equal(formatPhoneForDisplay("+966543264982"), "+966 54 326 4982");
});

test("formatPhoneTelLink strips display spaces", () => {
  assert.equal(formatPhoneTelLink("+966 11 499 9925"), "+966114999925");
});
