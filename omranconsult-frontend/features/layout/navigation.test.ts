import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  FOOTER_COLUMNS,
  FOOTER_COLUMNS_COMPACT,
  hasPhotoHero,
  isActiveNavHref,
  MOBILE_NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
} from "./navigation.ts";

type Messages = { Layout: { nav: Record<string, unknown>; footer: Record<string, unknown> } };

const loadMessages = (locale: "en" | "ar"): Messages => {
  const url = new URL(`../../messages/${locale}.json`, import.meta.url);
  return JSON.parse(readFileSync(url, "utf8")) as Messages;
};

test("header links follow the design order (PHASE4C §3)", () => {
  assert.deepEqual(
    PRIMARY_NAV_ITEMS.map((item) => item.href),
    ["/", "/about", "/services", "/projects", "/about#credentials", "/media"],
  );
});

test("the mobile menu adds Contact at the end", () => {
  assert.equal(MOBILE_NAV_ITEMS.at(-1)?.href, "/contact");
  assert.equal(MOBILE_NAV_ITEMS.length, 7);
});

test("navigation links carry no query strings and careers stays hidden", () => {
  const all = [...MOBILE_NAV_ITEMS, ...Object.values(FOOTER_COLUMNS).flat(), ...Object.values(FOOTER_COLUMNS_COMPACT).flat()];
  for (const item of all) {
    assert.doesNotMatch(item.href, /[?&]/, `unexpected query in ${item.href}`);
    assert.doesNotMatch(item.href, /careers/);
  }
});

test("every navigation label exists in English and Arabic messages", () => {
  for (const locale of ["en", "ar"] as const) {
    const { nav, footer } = loadMessages(locale).Layout;
    for (const item of MOBILE_NAV_ITEMS) {
      assert.equal(typeof nav[item.messageKey], "string", `${locale}: Layout.nav.${item.messageKey} missing`);
    }
    for (const item of [...Object.values(FOOTER_COLUMNS).flat(), ...Object.values(FOOTER_COLUMNS_COMPACT).flat()]) {
      assert.equal(typeof footer[item.messageKey], "string", `${locale}: Layout.footer.${item.messageKey} missing`);
    }
  }
});

test("photo-hero routes start with a transparent header", () => {
  for (const path of ["/", "/about", "/services", "/projects", "/projects/cop16-technical-audit", "/about/"]) {
    assert.equal(hasPhotoHero(path), true, path);
  }
  for (const path of ["/contact", "/media", "/media/some-post", "/missing"]) {
    assert.equal(hasPhotoHero(path), false, path);
  }
});

test("active link matching", () => {
  assert.equal(isActiveNavHref("/", "/"), true);
  assert.equal(isActiveNavHref("/", "/about"), false);
  assert.equal(isActiveNavHref("/projects", "/projects/cop16-technical-audit"), true);
  assert.equal(isActiveNavHref("/about#credentials", "/about"), false);
  assert.equal(isActiveNavHref("/media", "/media"), true);
});
