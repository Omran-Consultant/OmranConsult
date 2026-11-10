export type ApiHealthResponse = {
  status: "ok";
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  is_active: boolean;
  department: string | null;
  dashboard_locale: "ar" | "en" | null;
  notify_inquiries: boolean;
  mfa_enabled: boolean;
  last_login_at: string | null;
};

export type AdminUserResponse = {
  user: AdminUser;
};

export type AdminLogoutResponse = {
  message: string;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
  remember?: boolean;
};

export type AdminMfaPendingResponse = {
  mfa_required: true;
};

export type AdminSummaryResponse = {
  kpis: {
    projects_total: number;
    projects_published: number;
    projects_draft: number;
    projects_content_drafts: number;
    inquiries_new: number;
    inquiries_this_month: number;
    inquiries_last_month: number;
    drafts_awaiting_publish: number;
    last_content_edit_at: string | null;
    open_disputes: number;
    disputes_blocking_publish: number;
    expired_certificates: number;
    certificates_total: number;
  };
  inquiries_chart: { month: string; count: number }[];
  sectors: { slug: string; name: { ar: string; en: string }; count: number }[];
  latest_inquiries: { id: number; name: string; email: string; status: string; created_at: string }[];
  latest_edits: { id: number; slug: string; title: { ar: string; en: string }; status: string; updated_at: string }[];
  recent_activity: {
    id: number;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    occurred_at: string;
    user_id: number | null;
    user_name: string | null;
  }[];
};

export type AdminProjectListItem = {
  id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  status: string;
  client_id: number | null;
  sector_id: number | null;
  client_name?: { ar?: string | null; en?: string | null } | null;
  sector_name?: { ar?: string | null; en?: string | null } | null;
  region_names?: { ar?: string | null; en?: string | null }[];
  cover_path?: string | null;
  cover_url?: string | null;
  year?: number | null;
  has_demo_content: boolean;
  updated_at: string | null;
};

export type AdminPublishBlocker = { field: string; code: string };

export type AdminGalleryItem = {
  key: string | null;
  media_id: number | null;
  url: string | null;
  srcset: string | null;
  width: number | null;
  height: number | null;
  alt: { ar?: string | null; en?: string | null };
};

export type AdminLookup = {
  id: number;
  slug: string;
  name: { ar?: string | null; en?: string | null };
};

export type AdminProjectDetail = {
  id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  overview: { ar?: unknown; en?: unknown } | null;
  client_id: number | null;
  sector_id: number | null;
  year: number | null;
  location: { ar?: string | null; en?: string | null } | null;
  service_type: { ar?: string | null; en?: string | null } | null;
  delivery_status: string | null;
  scope: { ar?: string[] | null; en?: string[] | null } | null;
  gallery: AdminGalleryItem[] | null;
  region_ids: number[];
  is_featured: boolean;
  featured_order: number | null;
  sort_order: number | null;
  seo: { title?: { ar?: string | null; en?: string | null }; description?: { ar?: string | null; en?: string | null } } | null;
  og_image_media_id: number | null;
  status: string;
  has_unpublished_changes: boolean;
  has_demo_content: boolean;
  draft: Record<string, unknown> | null;
  published_at: string | null;
  publish_blockers: AdminPublishBlocker[];
  client_name?: { ar?: string | null; en?: string | null } | null;
  sector_name?: { ar?: string | null; en?: string | null } | null;
  updated_at: string | null;
  lookups?: { clients: AdminLookup[]; sectors: AdminLookup[]; regions: AdminLookup[] };
};

export type AdminServiceItem = {
  id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  sort_order: number;
  status: string;
};

export type AdminServiceCategory = {
  id: number;
  slug: string;
  kind: string;
  title: { ar?: string | null; en?: string | null };
  icon: string | null;
  sort_order: number;
  status: string;
  services: AdminServiceItem[];
  updated_at: string | null;
};

export type AdminServiceCategoryDetail = {
  id: number;
  slug: string;
  kind: string;
  title: { ar?: string | null; en?: string | null };
  icon: string | null;
  sort_order: number;
  status: string;
  has_unpublished_changes: boolean;
  draft: Record<string, unknown> | null;
  publish_blockers: AdminPublishBlocker[];
  published_at: string | null;
  updated_at: string | null;
  icons: string[];
};

export type AdminServiceItemDetail = {
  id: number;
  category_id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  sort_order: number;
  status: string;
  has_unpublished_changes: boolean;
  draft: Record<string, unknown> | null;
  publish_blockers: AdminPublishBlocker[];
  published_at: string | null;
  updated_at: string | null;
};

export type AdminServiceToolsResponse = {
  icons: string[];
  data: {
    id: number;
    page: string;
    payload: {
      section_title: { ar?: string; en?: string };
      items: { title: { ar: string; en: string }; body: { ar: string; en: string }; icon: string }[];
    };
    status: string;
  }[];
};

export type AdminNewsListItem = {
  id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  status: string;
  is_demo: boolean;
  is_featured: boolean;
  category: { id: number; slug: string; name: { ar?: string | null; en?: string | null } } | null;
  cover_image: string | null;
  cover_url: string | null;
  published_at: string | null;
  updated_at: string | null;
};

export type AdminNewsDetail = {
  id: number;
  slug: string;
  title: { ar?: string | null; en?: string | null };
  excerpt: { ar?: string | null; en?: string | null };
  body: { ar?: unknown; en?: unknown };
  news_category_id: number | null;
  cover_image: string | null;
  cover_media_id: number | null;
  cover_url: string | null;
  author: { ar?: string | null; en?: string | null } | null;
  tags: unknown;
  is_featured: boolean;
  is_demo: boolean;
  sort_order: number;
  seo: { title?: { ar?: string | null; en?: string | null }; description?: { ar?: string | null; en?: string | null } } | null;
  og_image_media_id: number | null;
  status: string;
  has_unpublished_changes: boolean;
  draft: Record<string, unknown> | null;
  publish_blockers: AdminPublishBlocker[];
  published_at: string | null;
  updated_at: string | null;
  lookups?: { categories: AdminLookup[] };
};
