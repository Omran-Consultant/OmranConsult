import assert from "node:assert/strict";
import test from "node:test";

import { blankLike, completeness, isLongText, isTranslationMap, moveItem, parseFieldPath, setAtPath, type PayloadNode } from "./payload-tree.ts";

const payload: PayloadNode = {
  hero: { title: { ar: "عنوان", en: "Title" }, overline: { ar: "ABOUT", en: "ABOUT" } },
  items: [
    { number: "01", icon: "building", href: "/services#pillars", title: { ar: "أ", en: "A" } },
    { number: "02", icon: "layers", href: "/services#offerings", title: { ar: "ب", en: "" } },
  ],
  body: [{ ar: "فقرة", en: "Paragraph" }],
};

test("a translation map has exactly ar and en with string or null values", () => {
  assert.equal(isTranslationMap({ ar: "أ", en: null }), true);
  assert.equal(isTranslationMap({ ar: "أ", en: "A", fr: "A" }), false);
  assert.equal(isTranslationMap({ ar: ["أ"], en: ["A"] }), false);
  assert.equal(isTranslationMap("text"), false);
  assert.equal(isTranslationMap([{ ar: "أ", en: "A" }]), false);
});

test("setAtPath replaces one leaf and leaves the original untouched", () => {
  const next = setAtPath(payload, ["items", 1, "title", "en"], "B") as { items: { title: { en: string } }[]; hero: unknown };
  assert.equal(next.items[1]?.title.en, "B");
  assert.equal((payload as { items: { title: { en: string } }[] }).items[1]?.title.en, "");
  assert.equal(next.hero, (payload as { hero: unknown }).hero);
});

test("a new list item is blank text in the sibling's shape and keeps its icon and link", () => {
  const first = (payload as { items: PayloadNode[] }).items[0] ?? null;
  assert.deepEqual(blankLike(first), { number: "01", icon: "building", href: "/services#pillars", title: { ar: "", en: "" } });
  assert.deepEqual(blankLike({ ar: "فقرة", en: "Paragraph" }), { ar: "", en: "" });
  assert.deepEqual(blankLike({ title: { ar: "أ", en: "A" }, items: [{ ar: "س", en: "s" }, { ar: "ص", en: "t" }] }), {
    title: { ar: "", en: "" },
    items: [{ ar: "", en: "" }],
  });
});

test("moveItem reorders and ignores an out-of-range move", () => {
  assert.deepEqual(moveItem(["a", "b", "c"], 0, 2), ["b", "c", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c"], 2, 3), ["a", "b", "c"]);
});

test("completeness counts filled translations per language and skips maps blank in both", () => {
  assert.deepEqual(completeness(payload, "ar"), { filled: 5, total: 5 });
  assert.deepEqual(completeness(payload, "en"), { filled: 4, total: 5 });
  assert.deepEqual(completeness({ subline: { ar: "", en: "" } }, "en"), { filled: 0, total: 0 });
});

test("long or multi-line text is edited in a textarea", () => {
  assert.equal(isLongText({ ar: "عنوان", en: "Title" }), false);
  assert.equal(isLongText({ ar: "سطر\nسطر", en: "Line" }), true);
  assert.equal(isLongText({ ar: "عنوان", en: "a".repeat(91) }), true);
});

test("an API field path becomes a payload path", () => {
  assert.deepEqual(parseFieldPath("payload.items.1.title"), ["items", 1, "title"]);
  assert.deepEqual(parseFieldPath("payload"), []);
});
