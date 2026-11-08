import { z } from "zod";

/*
 * Home design copy (SDD P22, PHASE4C D4): seeded marketing text. Every field is optional so a
 * missing string hides its element instead of breaking the page; no text is hard-coded.
 */
const text = z.string().trim().min(1).optional().catch(undefined);
const titled = z.object({ overline: text, title: text, subtitle: text }).catch({});

export const homeCopySchema = z
  .object({
    hero: z
      .object({
        overline: text,
        headline: text,
        lead: text,
        cta_primary: text,
        cta_secondary: text,
        stat_labels: z.record(text).catch({}).default({}),
      })
      .catch({ stat_labels: {} })
      .default({ stat_labels: {} }),
    stats: z.object({ overline: text, title: text, side_text: text }).catch({}).default({}),
    about: z
      .object({
        overline: text,
        title: text,
        intro: text,
        badge_label: text,
        link: text,
        features: z.array(z.object({ title: text, text: text })).catch([]).default([]),
      })
      .catch({ features: [] })
      .default({ features: [] }),
    services: titled.default({}),
    projects: titled.default({}),
    coverage: titled.default({}),
    trust: titled.and(z.object({ partners_label: text }).catch({})).default({}),
    cta: z.object({ title: text, text: text, primary: text, secondary: text }).catch({}).default({}),
  })
  .catch({
    hero: { stat_labels: {} },
    stats: {},
    about: { features: [] },
    services: {},
    projects: {},
    coverage: {},
    trust: {},
    cta: {},
  });

export type HomeCopy = z.infer<typeof homeCopySchema>;

export const serviceHighlightsSchema = z
  .object({
    items: z
      .array(
        z.object({
          number: z.string(),
          icon: z.string(),
          title: text,
          description: text,
          href: z.string().startsWith("/"),
        }),
      )
      .catch([]),
  })
  .catch({ items: [] });
