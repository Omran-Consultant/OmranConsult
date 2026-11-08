import assert from "node:assert/strict";
import test from "node:test";

import { buildPublicLocaleAlternates } from "./locale-metadata.ts";

test("buildPublicLocaleAlternates uses relative URLs when site URL is unset", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;

  assert.deepEqual(buildPublicLocaleAlternates("en"), {
    canonical: "/en",
    languages: {
      en: "/en",
      ar: "/ar",
      "x-default": "/en",
    },
  });

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("buildPublicLocaleAlternates uses configured origin when set", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

  assert.deepEqual(buildPublicLocaleAlternates("ar"), {
    canonical: "https://example.test/ar",
    languages: {
      en: "https://example.test/en",
      ar: "https://example.test/ar",
      "x-default": "https://example.test/en",
    },
  });

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("buildPublicLocaleAlternates keeps the route path in canonical and hreflang", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";

  assert.deepEqual(buildPublicLocaleAlternates("ar", "/projects/a-b"), {
    canonical: "https://example.test/ar/projects/a-b",
    languages: {
      en: "https://example.test/en/projects/a-b",
      ar: "https://example.test/ar/projects/a-b",
      "x-default": "https://example.test/en/projects/a-b",
    },
  });

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
