import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { FOOTER_QUICK_LINKS, PRIMARY_NAV_ITEMS } from "./navigation.ts";

const loadNavMessages = (locale: "en" | "ar"): Record<string, unknown> => {
  const url = new URL(`../../messages/${locale}.json`, import.meta.url);
  const messages = JSON.parse(readFileSync(url, "utf8")) as {
    Layout: { nav: Record<string, unknown> };
  };
  return messages.Layout.nav;
};

test("primary navigation matches the SDD §4.2 public routes in order", () => {
  assert.deepEqual(
    PRIMARY_NAV_ITEMS.map((item) => item.href),
    ["/", "/about", "/services", "/projects", "/#contact"],
  );
});

test("navigation links carry no old-site filter or category query strings", () => {
  for (const item of [...PRIMARY_NAV_ITEMS, ...FOOTER_QUICK_LINKS]) {
    assert.doesNotMatch(item.href, /[?&]/, `unexpected query in ${item.href}`);
  }
});

test("footer quick links are a subset of primary navigation", () => {
  const primaryHrefs = new Set<string>(PRIMARY_NAV_ITEMS.map((item) => item.href));
  for (const item of FOOTER_QUICK_LINKS) {
    assert.ok(primaryHrefs.has(item.href), `${item.href} missing from primary nav`);
  }
});

test("every navigation label exists in English and Arabic messages", () => {
  for (const locale of ["en", "ar"] as const) {
    const nav = loadNavMessages(locale);
    for (const item of [...PRIMARY_NAV_ITEMS, ...FOOTER_QUICK_LINKS]) {
      assert.equal(
        typeof nav[item.messageKey],
        "string",
        `${locale}: Layout.nav.${item.messageKey} missing`,
      );
    }
  }
});
