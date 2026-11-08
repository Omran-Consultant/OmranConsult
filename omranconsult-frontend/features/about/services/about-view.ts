import { z } from "zod";

import { formatStatisticValue } from "@/features/home/services/statistic-formatter";
import { getClientLogo, getPartnerLogo } from "@/features/media/brand-logos";
import type { AppLocale } from "@/i18n/routing";

const text = z.string().trim().min(1).optional().catch(undefined);
const texts = z.array(z.string()).catch([]).default([]);
const titledItems = z.object({ title: text, items: texts });

/** About design copy (SDD P22, page `about`). */
export const aboutCopySchema = z
  .object({
    hero: z.object({ title: text, intro: text, intro_short: text }).catch({}).default({}),
    intro: z.object({ overline: text, stat_labels: z.record(text).catch({}).default({}) }).catch({ stat_labels: {} }).default({ stat_labels: {} }),
    education_goals: z.object({ overline: text }).catch({}).default({}),
    strategy: z.object({ overline: text, title: text }).catch({}).default({}),
    esg: z.object({ overline: text }).catch({}).default({}),
    work_stages: z.object({ overline: text }).catch({}).default({}),
    experts: z.object({ overline: text, subtitle: text }).catch({}).default({}),
    org_chart: z.object({ overline: text }).catch({}).default({}),
    licenses: z.object({ overline: text }).catch({}).default({}),
    partners: z.object({ overline: text }).catch({}).default({}),
    clients: z.object({ overline: text }).catch({}).default({}),
  })
  .catch({ hero: {}, intro: { stat_labels: {} }, education_goals: {}, strategy: {}, esg: {}, work_stages: {}, experts: {}, org_chart: {}, licenses: {}, partners: {}, clients: {} });

/** Profile blocks used by About (SDD §6.3.3). Missing parts render nothing. */
export const aboutBlocksSchema = z.object({
  about: z.object({ heading: text, body: texts }).catch({ body: [] }).default({ body: [] }),
  education_goals: z
    .object({ section_title: text, items: z.array(z.object({ lead: text, body: text })).catch([]).default([]) })
    .catch({ items: [] })
    .default({ items: [] }),
  strategy: z
    .object({
      vision: z.object({ title: text, body: text }).optional().catch(undefined),
      mission: z.object({ title: text, body: text }).optional().catch(undefined),
      objectives: z.object({ title: text, body: text }).optional().catch(undefined),
    })
    .catch({})
    .default({}),
  esg: z
    .object({ section_title: text, body: texts, pillars: z.array(titledItems).catch([]).default([]) })
    .catch({ body: [], pillars: [] })
    .default({ body: [], pillars: [] }),
  work_stages: z
    .object({
      stages: z.array(titledItems).catch([]).default([]),
      coverage: z.object({ heading: text, body: text }).optional().catch(undefined),
    })
    .catch({ stages: [] })
    .default({ stages: [] }),
  credentials: z
    .object({ licenses_title: text, licenses_intro: text, certificates_title: text, certificates_intro: text })
    .catch({})
    .default({}),
  section_titles: z
    .object({ experts: text, org_chart: text, org_groups: z.record(text).catch({}).default({}) })
    .catch({ org_groups: {} })
    .default({ org_groups: {} }),
});

export type AboutBlocks = z.infer<typeof aboutBlocksSchema>;
export type AboutCopy = z.infer<typeof aboutCopySchema>;

type Statistic = { key: string; value: number; scale?: string; suffix?: string; unit?: string; label?: string };

export function formatStats(statistics: readonly Statistic[], keys: readonly string[], locale: AppLocale) {
  return keys
    .map((key) => statistics.find((stat) => stat.key === key))
    .filter((stat): stat is Statistic => Boolean(stat))
    .map((stat) => ({
      key: stat.key,
      value: formatStatisticValue({ value: stat.value, scale: stat.scale, suffix: stat.suffix, unit: stat.unit, locale }),
      label: stat.label,
    }));
}

export function partnerCards(partners: readonly { slug?: string; name?: string; field?: string }[]) {
  return partners
    .filter((partner) => partner.slug && partner.name)
    .map((partner) => ({ slug: partner.slug as string, name: partner.name as string, field: partner.field, logo: getPartnerLogo(partner.slug) }));
}

export function clientLogos(clients: readonly { slug?: string; name?: string; inClientList: boolean; sortOrder: number }[]) {
  return clients
    .filter((client) => client.inClientList)
    .map((client) => ({ key: client.slug ?? `client-${client.sortOrder}`, name: client.name, logo: getClientLogo(client.slug, client.sortOrder) }))
    .filter((client) => client.logo);
}
