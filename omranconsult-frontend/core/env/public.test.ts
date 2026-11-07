import assert from "node:assert/strict";
import test from "node:test";

import { getPublicSiteOrigin } from "./public.ts";

test("getPublicSiteOrigin defaults to localhost site URL", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  assert.equal(getPublicSiteOrigin(), "http://localhost:3000");

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
