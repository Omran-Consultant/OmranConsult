import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAccentText, stripAccentMarkers } from "./accent-text.ts";

describe("parseAccentText", () => {
  it("splits lines and marks the accent word", () => {
    assert.deepEqual(parseAccentText("نبني {accent}كفاءة{/accent} الأصول\nلمستقبل مستدام"), [
      [
        { text: "نبني ", accent: false },
        { text: "كفاءة", accent: true },
        { text: " الأصول", accent: false },
      ],
      [{ text: "لمستقبل مستدام", accent: false }],
    ]);
  });

  it("returns plain text as one segment", () => {
    assert.deepEqual(parseAccentText("Our projects"), [[{ text: "Our projects", accent: false }]]);
  });

  it("drops empty lines", () => {
    assert.deepEqual(parseAccentText("a\n\nb"), [[{ text: "a", accent: false }], [{ text: "b", accent: false }]]);
  });
});

describe("stripAccentMarkers", () => {
  it("removes markers and joins lines", () => {
    assert.equal(stripAccentMarkers("Building asset {accent}efficiency{/accent}\nfor a sustainable future"), "Building asset efficiency for a sustainable future");
  });
});
