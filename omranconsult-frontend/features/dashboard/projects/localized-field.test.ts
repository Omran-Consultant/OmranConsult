import assert from "node:assert/strict";
import test from "node:test";

import { readLocalizedField, readLocalizedFieldPreferringLive } from "./localized-field.ts";

test("readLocalizedField reads ar/en objects and ignores empty draft strings", () => {
  assert.equal(readLocalizedField({ ar: "نبذة منشورة", en: "Published overview" }, "ar"), "نبذة منشورة");
  assert.equal(readLocalizedField("plain", "ar"), "plain");
  assert.equal(readLocalizedField(null, "ar"), "");
});

test("readLocalizedFieldPreferringLive falls back to published when the draft locale is empty", () => {
  assert.equal(
    readLocalizedFieldPreferringLive({ ar: "", en: "" }, { ar: "نبذة منشورة", en: "Published overview" }, "ar"),
    "نبذة منشورة",
  );
  assert.equal(
    readLocalizedFieldPreferringLive({ ar: "مسودة", en: "Draft" }, { ar: "نبذة منشورة", en: "Published overview" }, "ar"),
    "مسودة",
  );
});
