import assert from "node:assert/strict";
import test from "node:test";

import { articleBlocks, MAX_NEWS_PAGE, mediaQuery, parseMediaFilters, readingMinutes } from "./news-view.ts";

test("parses the category slug and clamps the page", () => {
  assert.deepEqual(parseMediaFilters({ category: "events", page: "3" }), { category: "events", page: 3 });
  assert.deepEqual(parseMediaFilters({ category: "<script>", page: "-2" }), { category: undefined, page: 1 });
  assert.equal(parseMediaFilters({ page: "999" }).page, MAX_NEWS_PAGE);
});

test("builds the query string without defaults", () => {
  assert.equal(mediaQuery({ page: 1 }), "");
  assert.equal(mediaQuery({ category: "projects", page: 1 }, { page: 2 }), "?category=projects&page=2");
  assert.equal(mediaQuery({ category: "projects", page: 3 }, { category: undefined, page: 1 }), "");
});

test("keeps known blocks with content only", () => {
  const blocks = articleBlocks([
    { type: "paragraph", text: " نص " },
    { type: "heading", text: "" },
    { type: "image", image: "night" },
    { type: "video", text: "x" },
  ]);
  assert.deepEqual(blocks, [
    { type: "paragraph", text: "نص" },
    { type: "image", image: "night" },
  ]);
});

test("reading time rounds up whole minutes and needs text", () => {
  assert.equal(readingMinutes([{ type: "paragraph", text: Array(201).fill("كلمة").join(" ") }]), 2);
  assert.equal(readingMinutes([{ type: "paragraph", text: "كلمة" }]), 1);
  assert.equal(readingMinutes([{ type: "image", image: "night" }]), undefined);
});
