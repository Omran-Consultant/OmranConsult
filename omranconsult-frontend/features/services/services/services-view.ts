import { z } from "zod";

import type { IconName } from "@/core/ui/icon";

const text = z.string().trim().min(1).optional().catch(undefined);
const texts = z.array(z.string()).catch([]).default([]);
const header = z.object({ overline: text, overline_short: text, title: text, title_short: text, subtitle: text }).catch({}).default({});

/** Services design copy (SDD P22, page `services`). */
export const servicesCopySchema = z
  .object({
    hero: z.object({ title: text, intro: text, intro_short: text }).catch({}).default({}),
    pillars: header,
    asset_management: header,
    engineering: header,
    approach: header,
    offerings: header,
    tools: header,
  })
  .catch({ hero: {}, pillars: {}, asset_management: {}, engineering: {}, approach: {}, offerings: {}, tools: {} });

const titledList = z
  .object({ section_title: text, items: z.array(z.object({ title: text })).catch([]).default([]) })
  .catch({ items: [] })
  .default({ items: [] });

/** Profile blocks used by Services (SDD §6.3.3). */
export const servicesBlocksSchema = z.object({
  engineering_design: z.object({ section_title: text, body: text }).catch({}).default({}),
  multi_phase_approach: z.object({ section_title: text, steps: texts, outputs: texts }).catch({ steps: [], outputs: [] }).default({ steps: [], outputs: [] }),
  core_offerings: titledList,
  flexible_model: titledList,
  tools: z
    .object({ section_title: text, items: z.array(z.object({ title: text, body: text })).catch([]).default([]) })
    .catch({ items: [] })
    .default({ items: [] }),
});

export type ServicesCopy = z.infer<typeof servicesCopySchema>;
export type ServicesBlocks = z.infer<typeof servicesBlocksSchema>;

/** Pillar icons in the API axis order (Figma Pillar Card icons). */
export const PILLAR_ICONS: readonly IconName[] = ["building", "chart", "trending-up"];

/**
 * Tool icons in the profile order (PHASE4C_FIGMA §6.3: one icon per tool):
 * sedans, total station, GPS station, computers, printer, colour copier, 4×4 vehicles,
 * attendance terminal, drone, engineering software.
 */
export const TOOL_ICONS: readonly IconName[] = ["car", "total-station", "map-pin", "monitor", "file", "image", "car", "clock", "drone", "layers"];

/** Splits a list into two columns, first half then second half (Figma Asset Management 01-05 | 06-10). */
export function splitColumns<T>(items: readonly T[]): [T[], T[]] {
  const half = Math.ceil(items.length / 2);
  return [items.slice(0, half), items.slice(half)];
}
