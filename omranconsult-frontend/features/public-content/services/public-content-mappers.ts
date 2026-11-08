import type {
  ClientsResponse,
  DocumentsResponse,
  ExpertsResponse,
  HomeResponse,
  NewsCategoriesResponse,
  NewsDetailResponse,
  NewsIndexResponse,
  PageResponse,
  OrgChartResponse,
  PartnersResponse,
  ProjectDetailResponse,
  ProjectsIndexResponse,
  RegionsResponse,
  SectorsResponse,
  ServicesResponse,
  SettingsResponse,
} from "@/features/public-content/schemas/public-api-schemas";

function mapOptionalText(value: string | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function mapSettingsToUiModel(payload: SettingsResponse) {
  return {
    locale: payload.locale,
    companyLegalName: mapOptionalText(payload.data.company_legal_name),
    contact: {
      address: mapOptionalText(payload.data.contact.address),
      postal: mapOptionalText(payload.data.contact.postal),
      email: mapOptionalText(payload.data.contact.email),
      phones: payload.data.contact.phones,
    },
    workingHours: mapOptionalText(payload.data.working_hours ?? null),
    profilePdfUrl: payload.data.profile_pdf_url ?? undefined,
  };
}

/** Raw page blocks; each feature validates the copy it reads with its own schema. */
export function mapPageToBlocks(payload: PageResponse): Record<string, unknown> {
  return payload.data.blocks;
}

export function mapHomeToUiModel(payload: HomeResponse) {
  return {
    locale: payload.locale,
    heroSlides: payload.data.hero_slides.map((slide) => ({
      key: slide.key,
      headline: mapOptionalText(slide.headline),
      subline: mapOptionalText(slide.subline),
    })),
    statistics: payload.data.statistics.map((stat) => ({
      key: stat.key,
      value: stat.value,
      unit: mapOptionalText(stat.unit),
      suffix: mapOptionalText(stat.suffix),
      scale: mapOptionalText(stat.scale),
      label: mapOptionalText(stat.label),
    })),
    blocks: payload.data.blocks,
  };
}

export function mapServicesToUiModel(payload: ServicesResponse) {
  return payload.data.map((category) => ({
    slug: category.slug,
    kind: category.kind,
    title: mapOptionalText(category.title),
    services: category.services.map((service) => ({
      slug: service.slug,
      title: mapOptionalText(service.title),
    })),
  }));
}

function mapProjectSummary(project: ProjectsIndexResponse["data"][number]) {
  return {
    slug: project.slug,
    title: mapOptionalText(project.title),
    client: project.client
      ? {
          slug: mapOptionalText(project.client.slug),
          name: mapOptionalText(project.client.name),
        }
      : undefined,
    sector: project.sector ? { slug: project.sector.slug, name: mapOptionalText(project.sector.name) } : undefined,
    year: project.year ?? undefined,
    imageKey: mapOptionalText(project.image ?? null),
    regions: project.regions.map((region) => ({
      slug: region.slug,
      code: mapOptionalText(region.code),
      name: mapOptionalText(region.name),
      projectsCount: region.projects_count,
    })),
  };
}

export function mapProjectsIndexToUiModel(payload: ProjectsIndexResponse) {
  return {
    locale: payload.locale,
    projects: payload.data.map(mapProjectSummary),
    links: payload.links,
    meta: payload.meta,
  };
}

export function mapProjectDetailToUiModel(payload: ProjectDetailResponse) {
  const project = payload.data;
  return {
    locale: payload.locale,
    ...mapProjectSummary(project),
    location: mapOptionalText(project.location ?? null),
    serviceType: mapOptionalText(project.service_type ?? null),
    deliveryStatus: project.delivery_status ?? undefined,
    overview: mapOptionalText(project.overview ?? null),
    scope: (project.scope ?? []).map((item) => item.trim()).filter(Boolean),
    gallery: project.gallery ?? [],
    related: (project.related ?? []).map(mapProjectSummary),
  };
}

export function mapSectorsToUiModel(payload: SectorsResponse) {
  return payload.data.map((sector) => ({
    slug: sector.slug,
    name: mapOptionalText(sector.name),
    projectsCount: sector.projects_count ?? 0,
  }));
}

export function mapClientsToUiModel(payload: ClientsResponse) {
  return payload.data.map((client, index) => ({
    slug: mapOptionalText(client.slug),
    name: mapOptionalText(client.name),
    inClientList: client.in_client_list,
    projectsCount: client.projects_count,
    sortOrder: index + 1,
  }));
}

export function mapRegionsToUiModel(payload: RegionsResponse) {
  return payload.data.map((region) => ({
    slug: region.slug,
    code: mapOptionalText(region.code),
    name: mapOptionalText(region.name),
    projectsCount: region.projects_count,
  }));
}

export function mapExpertsToUiModel(payload: ExpertsResponse) {
  return payload.data.map((expert) => ({
    id: expert.id,
    slug: mapOptionalText(expert.slug) ?? `expert-${expert.id}`,
    name: mapOptionalText(expert.name),
    title: mapOptionalText(expert.title),
    bio: mapOptionalText(expert.bio),
    yearsExperience: expert.years_experience,
  }));
}

export function mapOrgChartToUiModel(payload: OrgChartResponse) {
  return payload.data.map((position) => ({
    id: position.id,
    parentId: position.parent_id,
    group: position.group,
    title: mapOptionalText(position.title),
    person: position.person
      ? {
          id: position.person.id,
          slug: position.person.slug,
          name: mapOptionalText(position.person.name),
        }
      : undefined,
  }));
}

export function mapDocumentsToUiModel(payload: DocumentsResponse) {
  return payload.data.map((document) => ({
    id: document.id,
    kind: document.kind,
    slug: mapOptionalText(document.slug),
    title: mapOptionalText(document.title),
    standardCode: mapOptionalText(document.standard_code),
    issuer: mapOptionalText(document.issuer),
    validFrom: mapOptionalText(document.valid_from),
    validUntil: mapOptionalText(document.valid_until),
    isExpired: document.is_expired,
  }));
}

export function mapPartnersToUiModel(payload: PartnersResponse) {
  return payload.data.map((partner) => ({
    id: partner.id,
    slug: mapOptionalText(partner.slug),
    name: mapOptionalText(partner.name),
    field: mapOptionalText(partner.field),
  }));
}

function mapNewsPost(post: NewsIndexResponse["data"][number]) {
  return {
    slug: post.slug,
    title: mapOptionalText(post.title),
    excerpt: mapOptionalText(post.excerpt),
    imageKey: mapOptionalText(post.cover_image),
    category: post.category?.name ? { slug: post.category.slug, name: post.category.name } : undefined,
    date: mapOptionalText(post.date),
    isFeatured: post.is_featured,
    isDemo: post.is_demo,
  };
}

export function mapNewsCategoriesToUiModel(payload: NewsCategoriesResponse) {
  return payload.data.flatMap((category) => {
    const name = mapOptionalText(category.name);
    return name ? [{ slug: category.slug, name }] : [];
  });
}

export function mapNewsIndexToUiModel(payload: NewsIndexResponse) {
  return {
    posts: payload.data.map(mapNewsPost),
    total: payload.meta.total,
    lastPage: payload.meta.last_page,
  };
}

export function mapNewsDetailToUiModel(payload: NewsDetailResponse) {
  const post = payload.data;
  return {
    ...mapNewsPost(post),
    author: mapOptionalText(post.author ?? null),
    tags: (post.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
    body: post.body ?? [],
    related: (post.related ?? []).map(mapNewsPost),
  };
}
