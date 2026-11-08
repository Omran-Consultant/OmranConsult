import assert from "node:assert/strict";
import test from "node:test";

import { isIndexableHost } from "./indexing.ts";

const production = { SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://www.example.com" };

test("the production domain is indexable when SITE_INDEXABLE is true", () => {
  assert.equal(isIndexableHost("www.example.com", production), true);
  assert.equal(isIndexableHost("WWW.Example.com", production), true);
});

test("any other host is not indexable, even with SITE_INDEXABLE=true", () => {
  assert.equal(isIndexableHost("abc.trycloudflare.com", production), false);
  assert.equal(isIndexableHost("localhost:3000", production), false);
  assert.equal(isIndexableHost("my-branch.vercel.app", production), false);
  assert.equal(isIndexableHost(null, production), false);
});

test("nothing is indexable unless SITE_INDEXABLE is exactly true", () => {
  assert.equal(isIndexableHost("www.example.com", { NEXT_PUBLIC_SITE_URL: "https://www.example.com" }), false);
  assert.equal(isIndexableHost("www.example.com", { ...production, SITE_INDEXABLE: "false" }), false);
  assert.equal(isIndexableHost("www.example.com", { SITE_INDEXABLE: "true" }), false);
});

test("local production build mode: localhost:3000 is indexable when configured", () => {
  const local = { SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" };
  assert.equal(isIndexableHost("localhost:3000", local), true);
  assert.equal(isIndexableHost("127.0.0.1:3000", local), false);
});
