import assert from "node:assert/strict";
import test from "node:test";

import { partnerCards } from "./brand-logos.ts";

test("attaches the profile logo by slug and drops a partner without a name", () => {
  const cards = partnerCards([
    { slug: "bureau-veritas", name: "BUREAU VERITAS", field: "Quality, compliance, and risk management" },
    { slug: "missing-name", field: "unused" },
    { slug: "unknown-firm", name: "Unknown firm" },
  ]);

  assert.deepEqual(
    cards.map((card) => ({ slug: card.slug, name: card.name, field: card.field, src: card.logo?.src })),
    [
      {
        slug: "bureau-veritas",
        name: "BUREAU VERITAS",
        field: "Quality, compliance, and risk management",
        src: "/images/partners/bureau-veritas.png",
      },
      { slug: "unknown-firm", name: "Unknown firm", field: undefined, src: undefined },
    ],
  );
});
