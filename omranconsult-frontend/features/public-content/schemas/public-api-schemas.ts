import { z } from "zod";

const localeSchema = z.enum(["ar", "en"]);
const nullableStringSchema = z.string().nullable();

const regionSchema = z.object({
  slug: z.string(),
  code: nullableStringSchema,
  name: nullableStringSchema,
  projects_count: z.number().int().nonnegative().optional(),
});

const projectSchema = z.object({
  slug: z.string(),
  title: nullableStringSchema,
  client: z
    .object({
      slug: nullableStringSchema,
      name: nullableStringSchema,
    })
    .nullable(),
  sector: z.object({ slug: z.string(), name: nullableStringSchema }).nullable().optional(),
  year: z.number().int().nullable().optional(),
  image: nullableStringSchema.optional(),
  regions: z.array(regionSchema),
});

const paginationLinkSchema = z.object({
  url: z.string().nullable(),
  label: z.string(),
  active: z.boolean(),
});

const projectsMetaSchema = z.object({
  current_page: z.number().int().positive(),
  from: z.number().int().positive().nullable(),
  last_page: z.number().int().positive(),
  links: z.array(paginationLinkSchema),
  path: z.string(),
  per_page: z.number().int().positive(),
  to: z.number().int().positive().nullable(),
  total: z.number().int().nonnegative(),
});

export const sectorsResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      slug: z.string(),
      name: nullableStringSchema,
      projects_count: z.number().int().nonnegative().optional(),
    }),
  ),
});

export const settingsResponseSchema = z.object({
  locale: localeSchema,
  data: z.object({
    company_legal_name: nullableStringSchema,
    contact: z.object({
      address: nullableStringSchema,
      postal: nullableStringSchema,
      email: nullableStringSchema,
      phones: z.array(z.string()),
    }),
    working_hours: nullableStringSchema.optional(),
    profile_pdf_url: z.string().url().nullable().optional(),
  }),
});

/** GET /api/pages/{page}: design copy and other blocks of one page (SDD P22). */
export const pageResponseSchema = z.object({
  locale: localeSchema,
  data: z.object({
    blocks: z.record(z.unknown()),
  }),
});

export const homeResponseSchema = z.object({
  locale: localeSchema,
  data: z.object({
    hero_slides: z.array(
      z.object({
        key: z.string(),
        headline: nullableStringSchema,
        subline: nullableStringSchema,
      }),
    ),
    statistics: z.array(
      z.object({
        key: z.string(),
        value: z.number(),
        unit: nullableStringSchema,
        suffix: nullableStringSchema,
        scale: nullableStringSchema,
        label: nullableStringSchema,
      }),
    ),
    blocks: z
      .record(z.unknown())
      .and(
        z.object({
          section_titles: z
            .object({
              statistics: nullableStringSchema.optional(),
              experts: nullableStringSchema.optional(),
              org_chart: nullableStringSchema.optional(),
              featured_projects: nullableStringSchema.optional(),
              org_groups: z.record(nullableStringSchema).optional(),
            })
            .optional(),
        }),
      ),
  }),
});

export const servicesResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      slug: z.string(),
      kind: z.enum(["axis", "asset_management", "engineering_design"]),
      title: nullableStringSchema,
      services: z.array(
        z.object({
          slug: z.string(),
          title: nullableStringSchema,
        }),
      ),
    }),
  ),
});

export const projectsIndexResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(projectSchema),
  links: z.object({
    first: z.string().url().nullable(),
    last: z.string().url().nullable(),
    prev: z.string().url().nullable(),
    next: z.string().url().nullable(),
  }),
  meta: projectsMetaSchema,
});

export const projectDetailResponseSchema = z.object({
  locale: localeSchema,
  data: projectSchema.extend({
    location: nullableStringSchema.optional(),
    service_type: nullableStringSchema.optional(),
    delivery_status: z.enum(["completed", "ongoing"]).nullable().optional(),
    overview: nullableStringSchema.optional(),
    scope: z.array(z.string()).optional(),
    gallery: z.array(z.string()).optional(),
    related: z.array(projectSchema).optional(),
  }),
});

export const clientsResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      slug: nullableStringSchema,
      name: nullableStringSchema,
      in_client_list: z.boolean(),
      projects_count: z.number().int().nonnegative(),
    }),
  ),
});

export const regionsResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(regionSchema),
});

export const expertsResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      slug: nullableStringSchema,
      name: nullableStringSchema,
      title: nullableStringSchema,
      bio: nullableStringSchema,
      years_experience: z.number().int().nonnegative(),
    }),
  ),
});

export const orgChartResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      parent_id: z.number().int().positive().nullable(),
      group: z.string(),
      title: nullableStringSchema,
      person: z
        .object({
          id: z.number().int().positive(),
          slug: z.string(),
          name: nullableStringSchema,
        })
        .nullable(),
    }),
  ),
});

export const documentsResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      kind: z.enum(["license", "iso_certificate"]),
      title: nullableStringSchema,
      standard_code: nullableStringSchema,
      issuer: nullableStringSchema,
      valid_from: nullableStringSchema,
      valid_until: nullableStringSchema,
      is_expired: z.boolean(),
    }),
  ),
});

export const partnersResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(
    z.object({
      id: z.number().int().positive(),
      slug: nullableStringSchema,
      name: nullableStringSchema,
      field: nullableStringSchema,
    }),
  ),
});

export type SettingsResponse = z.infer<typeof settingsResponseSchema>;
export type SectorsResponse = z.infer<typeof sectorsResponseSchema>;
export type HomeResponse = z.infer<typeof homeResponseSchema>;
export type PageResponse = z.infer<typeof pageResponseSchema>;
export type ServicesResponse = z.infer<typeof servicesResponseSchema>;
export type ProjectsIndexResponse = z.infer<typeof projectsIndexResponseSchema>;
export type ProjectDetailResponse = z.infer<typeof projectDetailResponseSchema>;
export type ClientsResponse = z.infer<typeof clientsResponseSchema>;
export type RegionsResponse = z.infer<typeof regionsResponseSchema>;
export type ExpertsResponse = z.infer<typeof expertsResponseSchema>;
export type OrgChartResponse = z.infer<typeof orgChartResponseSchema>;
export type DocumentsResponse = z.infer<typeof documentsResponseSchema>;
export type PartnersResponse = z.infer<typeof partnersResponseSchema>;
