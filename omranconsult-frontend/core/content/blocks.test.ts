import assert from "node:assert/strict";
import test from "node:test";

import { applyTextEdit, isAllowedHref, plainParagraph, setLink, toggleMark } from "./blocks.ts";

test("a single plain paragraph matches the legacy overview string", () => {
  assert.equal(plainParagraph([{ type: "paragraph", children: [{ text: "نبذة" }] }]), "نبذة");
  assert.equal(plainParagraph([{ type: "paragraph", children: [{ text: "نبذة", bold: true }] }]), null);
});

test("editing text keeps marks outside the change", () => {
  const next = applyTextEdit(
    [
      { text: "Hello " },
      { text: "world", bold: true },
    ],
    "Hello there world",
  );
  assert.deepEqual(next, [
    { text: "Hello there " },
    { text: "world", bold: true },
  ]);
});

test("marks and links stay inside the selection and reject unsafe urls", () => {
  const bold = toggleMark([{ text: "abcdef" }], 1, 4, "bold");
  assert.equal(bold[1]?.bold, true);
  assert.equal(bold[1]?.text, "bcd");
  const linked = setLink(bold, 1, 4, "https://omran.example");
  assert.equal(linked[1]?.href, "https://omran.example");
  const rejected = setLink(bold, 1, 4, "javascript:alert(1)");
  assert.equal(rejected[1]?.href, undefined);
  assert.equal(isAllowedHref("mailto:hello@omran.example"), true);
});
