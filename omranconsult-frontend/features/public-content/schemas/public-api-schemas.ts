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
  image_url: z.string().nullable().optional(),
  image_srcset: z.string().nullable().optional(),
  image_width: z.number().nullable().optional(),
  image_height: z.number().nullable().optional(),
  image_alt: z.string().nullable().optional(),
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
    profile_pdf_url: z.url().nullable().optional(),
  }),
});

/** GET /api/pages/{page}: design copy and other blocks of one page (SDD P22). */
export const pageResponseSchema = z.object({
  locale: localeSchema,
  data: z.object({
    blocks: z.record(z.string(), z.unknown()),
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
      .record(z.string(), z.unknown())
      .and(
        z.object({
          section_titles: z
            .object({
              statistics: nullableStringSchema.optional(),
              experts: nullableStringSchema.optional(),
              org_chart: nullableStringSchema.optional(),
              featured_projects: nullableStringSchema.optional(),
              org_groups: z.record(z.string(), nullableStringSchema).optional(),
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
      icon: z.string().nullable().optional(),
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
    first: z.url().nullable(),
    last: z.url().nullable(),
    prev: z.url().nullable(),
    next: z.url().nullable(),
  }),
  meta: projectsMetaSchema,
});

const inlineNodeSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  href: z.string().optional(),
});

const overviewBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), children: z.array(inlineNodeSchema) }),
  z.object({ type: z.literal("heading"), level: z.enum(["h2", "h3"]), children: z.array(inlineNodeSchema) }),
  z.object({ type: z.literal("list"), style: z.enum(["bullet", "number"]), items: z.array(z.array(inlineNodeSchema)) }),
  z.object({ type: z.literal("quote"), children: z.array(inlineNodeSchema) }),
]);

const projectGalleryItemSchema = z.object({
  key: z.string().nullable(),
  media_id: z.number().nullable(),
  url: z.string().nullable(),
  srcset: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  alt: z.string().nullable(),
});

const projectGallerySchema = z.array(z.union([z.string(), projectGalleryItemSchema]));

export const projectDetailResponseSchema = z.object({
  locale: localeSchema,
  data: projectSchema.extend({
    location: nullableStringSchema.optional(),
    service_type: nullableStringSchema.optional(),
    delivery_status: z.enum(["completed", "ongoing"]).nullable().optional(),
    overview: z.union([z.string(), z.array(overviewBlockSchema)]).nullable().optional(),
    scope: z.array(z.string()).optional(),
    gallery: projectGallerySchema.optional(),
    seo: z
      .object({
        title: nullableStringSchema,
        description: nullableStringSchema,
      })
      .nullable()
      .optional(),
    og_image: z
      .object({
        media_id: z.number(),
        url: z.string(),
        srcset: z.string().nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
        alt: z.string().nullable(),
      })
      .nullable()
      .optional(),
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
      slug: nullableStringSchema,
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

const newsPostSchema = z.object({
  slug: z.string(),
  title: nullableStringSchema,
  excerpt: nullableStringSchema,
  cover_image: nullableStringSchema,
  cover_url: nullableStringSchema.optional(),
  cover_srcset: nullableStringSchema.optional(),
  cover_width: z.number().nullable().optional(),
  cover_height: z.number().nullable().optional(),
  cover_alt: nullableStringSchema.optional(),
  category: z.object({ slug: z.string(), name: nullableStringSchema }).nullable(),
  date: nullableStringSchema,
  is_featured: z.boolean(),
  is_demo: z.boolean(),
});

export const newsCategoriesResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(z.object({ slug: z.string(), name: nullableStringSchema })),
});

export const newsIndexResponseSchema = z.object({
  locale: localeSchema,
  data: z.array(newsPostSchema),
  meta: projectsMetaSchema,
});

/** Body blocks (Q9): paragraph, heading, quote, list (`text` plus the editor structure) and image (`image` key); unknown types are dropped by the mapper. */
export const newsDetailResponseSchema = z.object({
  locale: localeSchema,
  data: newsPostSchema.extend({
    author: nullableStringSchema.optional(),
    tags: z.array(z.string()).optional(),
    body: z
      .array(
        z.object({
          type: z.string(),
          text: nullableStringSchema.optional(),
          image: nullableStringSchema.optional(),
          media_id: z.number().nullable().optional(),
          alt: nullableStringSchema.optional(),
          // Editor structure beside `text` (heading level, inline marks, list items).
          level: z.enum(["h2", "h3"]).optional().catch(undefined),
          children: z.array(inlineNodeSchema).optional().catch(undefined),
          style: z.enum(["bullet", "number"]).optional().catch(undefined),
          items: z.array(z.array(inlineNodeSchema)).optional().catch(undefined),
        }),
      )
      .optional(),
    seo: z
      .object({
        title: nullableStringSchema.optional(),
        description: nullableStringSchema.optional(),
      })
      .optional(),
    og_image: z
      .object({
        media_id: z.number().optional(),
        url: nullableStringSchema.optional(),
        srcset: nullableStringSchema.optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        alt: nullableStringSchema.optional(),
      })
      .nullable()
      .optional(),
    related: z.array(newsPostSchema).optional(),
  }),
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
export type NewsCategoriesResponse = z.infer<typeof newsCategoriesResponseSchema>;
export type NewsIndexResponse = z.infer<typeof newsIndexResponseSchema>;
export type NewsDetailResponse = z.infer<typeof newsDetailResponseSchema>;
