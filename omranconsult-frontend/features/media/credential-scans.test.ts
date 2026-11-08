import assert from "node:assert/strict";
import test from "node:test";

import { certificateScan, licenseScan } from "./credential-scans.ts";

test("maps each seeded certificate by slug and by standard code", () => {
  for (const [slug, code] of [
    ["iso-45001", "ISO 45001"],
    ["iso-14001", "ISO 14001"],
    ["iso-27001", "ISO/IEC 27001"],
    ["iso-9001", "ISO 9001"],
    ["iso-21500", "ISO 21500"],
    ["iso-41001", "ISO 41001"],
    ["iso-26000", "ISO 26000"],
    ["iso-31000", "ISO 31000"],
  ] as const) {
    const bySlug = certificateScan(slug);
    const byCode = certificateScan(code);
    assert.ok(bySlug, slug);
    assert.equal(bySlug.src, byCode?.src);
    assert.match(bySlug.src, /^\/images\/credentials\/iso-/);
  }
  assert.equal(certificateScan("ISO 55001"), undefined);
  assert.equal(certificateScan("iso-55001"), undefined);
});

test("a license image stays when its published title changes", () => {
  assert.equal(licenseScan("classification-certificate")?.src, "/images/credentials/classification.jpg");
  assert.equal(licenseScan("commercial-registration")?.src, "/images/credentials/commercial-registration.jpg");
  assert.equal(licenseScan("professional-licence")?.src, "/images/credentials/professional-practice.jpg");
  assert.equal(licenseScan("commercial-activity-licence")?.src, "/images/credentials/commercial-activity.jpg");
  assert.equal(licenseScan("civil-defence-licence")?.src, "/images/credentials/civil-defense.jpg");

  assert.equal(licenseScan("شهادة التصنيف (الدرجة الأولى)"), undefined);
  assert.equal(licenseScan("Classification Certificate (First Grade)"), undefined);
  assert.equal(licenseScan("عنوان جديد"), undefined);
  assert.equal(licenseScan("A rewritten English title"), undefined);
});
