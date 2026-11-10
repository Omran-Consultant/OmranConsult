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
  draft: Record<string, unknown> | null;
  published_at: string | null;
  publish_blockers: AdminPublishBlocker[];
  client_name?: { ar?: string | null; en?: string | null } | null;
  sector_name?: { ar?: string | null; en?: string | null } | null;
  updated_at: string | null;
  lookups?: { clients: AdminLookup[]; sectors: AdminLookup[]; regions: AdminLookup[] };
};
