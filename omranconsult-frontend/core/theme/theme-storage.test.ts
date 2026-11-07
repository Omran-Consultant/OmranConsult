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
  it("prefers stored preference over system", () => {
    assert.equal(resolveTheme("light", true), "light");
    assert.equal(resolveTheme("dark", false), "dark");
  });

  it("falls back to system preference when storage is empty", () => {
    assert.equal(resolveTheme(null, true), "dark");
    assert.equal(resolveTheme(null, false), "light");
  });
});
