import assert from "node:assert/strict";
import test from "node:test";

import {
  fieldLabel,
  hasFieldLabel,
  pageLabel,
  pathLabel,
  sectionHint,
  sectionLabel,
  slideLabel,
  sortEntriesByOrder,
} from "./field-labels.ts";

/** Every key the seeders put inside a content block payload (database/seeders, 2026-11-11). */
const SEEDED_KEYS =
  "about approach article_cta asset_management badge_label board board_committees body certificates_intro certificates_title clients committees completed_projects coverage cta cta_primary cta_secondary description detail education_goals employees engineering esg executive_management experts featured_projects features footer form_title group_experience heading headline hero href icon inquiry_text inquiry_title intro intro_short items lead lead_short licenses licenses_intro licenses_title link link_short local_content mission newsletter newsletter_text number objectives offerings org_chart org_groups outputs overline overline_short overview_overline overview_title partners partners_label partnerships pillars planning_control primary project_volume projects related_overline related_title scope_title secondary section_title services short_labels side_text stages stat_labels statistics stats steps strategy subtitle tagline text text_short title title_short tools trust vision work_stages years_experience";

const SECTION_KEYS = [
  "home.design_copy",
  "home.about",
  "home.section_titles",
  "home.service_highlights",
  "about.design_copy",
  "services.design_copy",
  "projects.design_copy",
  "contact.design_copy",
  "media.design_copy",
  "layout.design_copy",
];

test("every seeded payload key has a name in both languages", () => {
  for (const key of SEEDED_KEYS.split(" ")) {
    assert.equal(hasFieldLabel(key), true, key);
    assert.notEqual(fieldLabel(key, "ar"), key);
    assert.match(fieldLabel(key, "ar"), /[؀-ۿ]/, key);
    assert.doesNotMatch(fieldLabel(key, "en"), /[؀-ۿ_]/, key);
  }
});

test("an unknown key never shows as a raw key", () => {
  assert.equal(fieldLabel("some_new_key", "ar"), "حقل");
  assert.equal(pageLabel("unknown", "en"), "Page");
  assert.equal(sectionLabel("unknown", "ar"), "قسم");
  assert.equal(slideLabel("unknown", "en"), "Slide");
});

test("a blocker path reads as names, with list positions", () => {
  assert.equal(pathLabel(["hero", "title"], "ar"), "أعلى الصفحة ← العنوان");
  assert.equal(pathLabel(["items", 1, "title"], "en"), "Items → Item 2 → Title");
});

test("section names say where they appear and never use internal CMS labels", () => {
  for (const key of SECTION_KEYS) {
    const [page, section] = key.split(".");
    const ar = sectionLabel(section, "ar", page);
    const en = sectionLabel(section, "en", page);
    assert.match(ar, /[؀-ۿ]/, key);
    assert.doesNotMatch(ar, /نصوص التصميم|عناوين الأقسام|design_copy|section_titles/);
    assert.doesNotMatch(en, /Design copy|Section titles|design_copy|section_titles|_/);
    assert.ok(sectionHint(page, section, "ar"), key);
    assert.ok(sectionHint(page, section, "en"), key);
  }
});

test("sortEntriesByOrder keeps unknown keys after the preferred list", () => {
  const entries = [
    ["cta", 1],
    ["hero", 2],
    ["extra", 3],
  ] as const;
  assert.deepEqual(
    sortEntriesByOrder(entries, ["hero", "cta"]).map(([key]) => key),
    ["hero", "cta", "extra"],
  );
});
