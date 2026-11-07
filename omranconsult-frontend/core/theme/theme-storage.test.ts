import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  parseThemePreference,
  resolveTheme,
} from "./theme-storage.ts";

describe("parseThemePreference", () => {
  it("accepts light and dark only", () => {
    assert.equal(parseThemePreference("light"), "light");
    assert.equal(parseThemePreference("dark"), "dark");
    assert.equal(parseThemePreference("invalid"), null);
    assert.equal(parseThemePreference(null), null);
  });
});

describe("resolveTheme", () => {
  it("keeps the stored preference", () => {
    assert.equal(resolveTheme("light"), "light");
    assert.equal(resolveTheme("dark"), "dark");
  });

  it("defaults to dark when nothing is stored (D1)", () => {
    assert.equal(resolveTheme(null), "dark");
  });
});
