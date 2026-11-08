import assert from "node:assert/strict";
import test from "node:test";

import { galleryImages, MAX_PAGE, pageWindow, parseProjectsFilters, projectsQuery, searchTerm } from "./projects-filters.ts";

test("parses the URL state and drops invalid values", () => {
  assert.deepEqual(parseProjectsFilters({ sector: "health", q: "  مستشفى ", client: "Bad Slug!", page: "2" }), {
    sector: "health",
    q: "مستشفى",
    client: undefined,
    region: undefined,
    page: 2,
  });
  assert.equal(parseProjectsFilters({ page: "0" }).page, 1);
  assert.equal(parseProjectsFilters({ page: "abc" }).page, 1);
  assert.equal(parseProjectsFilters({ page: "999" }).page, MAX_PAGE);
});

test("ignores search text the API would reject", () => {
  assert.equal(searchTerm("a"), undefined);
  assert.equal(searchTerm("x".repeat(101)), undefined);
  assert.equal(searchTerm(" ري "), "ري");
});

test("builds the query, omitting page 1 and empty keys", () => {
  const filters = { sector: "health", q: "dam", page: 3 };
  assert.equal(projectsQuery(filters), "?sector=health&q=dam&page=3");
  assert.equal(projectsQuery(filters, { sector: undefined, page: 1 }), "?q=dam");
  assert.equal(projectsQuery({ page: 1 }), "");
});

test("page window keeps first, last and neighbours with gaps", () => {
  assert.deepEqual(pageWindow(1, 23), [1, 2, "gap", 23]);
  assert.deepEqual(pageWindow(5, 9), [1, "gap", 4, 5, 6, "gap", 9]);
  assert.deepEqual(pageWindow(2, 3), [1, 2, 3]);
  assert.deepEqual(pageWindow(3, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageWindow(1, 1), [1]);
});

test("gallery skips the hero photo and duplicates", () => {
  assert.deepEqual(galleryImages(["tablet"], "tablet"), []);
  assert.deepEqual(galleryImages(["tablet", "cad", "cad"], "tablet"), ["cad"]);
});
