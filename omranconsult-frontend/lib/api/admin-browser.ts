import {
  browserApiRequest,
  ensureSanctumCsrfCookie,
} from "@/lib/api/browser-client";
import type {
  AdminLoginRequest,
  AdminLogoutResponse,
  AdminMfaPendingResponse,
  AdminProjectDetail,
  AdminProjectListItem,
  AdminSummaryResponse,
  AdminUser,
  AdminUserResponse,
} from "@/lib/api/types";

export { ensureSanctumCsrfCookie };

export async function adminLogin(
  credentials: AdminLoginRequest,
): Promise<AdminUserResponse | AdminMfaPendingResponse> {
  await ensureSanctumCsrfCookie();

  return browserApiRequest<AdminUserResponse | AdminMfaPendingResponse>("/api/admin/login", {
    method: "POST",
    json: credentials,
  });
}

export async function adminLoginMfa(body: {
  code?: string;
  recovery_code?: string;
}): Promise<AdminUserResponse> {
  return browserApiRequest<AdminUserResponse>("/api/admin/login/mfa", {
    method: "POST",
    json: body,
  });
}

export async function adminForgotPassword(email: string): Promise<{ message: string }> {
  await ensureSanctumCsrfCookie();
  return browserApiRequest<{ message: string }>("/api/admin/forgot-password", {
    method: "POST",
    json: { email },
  });
}

export async function adminResetPassword(body: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  await ensureSanctumCsrfCookie();
  return browserApiRequest<{ message: string }>("/api/admin/reset-password", {
    method: "POST",
    json: body,
  });
}

export async function adminAcceptInvite(body: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;
}): Promise<AdminUserResponse> {
  await ensureSanctumCsrfCookie();
  return browserApiRequest<AdminUserResponse>("/api/admin/accept-invite", {
    method: "POST",
    json: body,
  });
}

export async function adminLogout(): Promise<AdminLogoutResponse> {
  return browserApiRequest<AdminLogoutResponse>("/api/admin/logout", {
    method: "POST",
  });
}

export async function adminMe(): Promise<AdminUserResponse> {
  return browserApiRequest<AdminUserResponse>("/api/admin/me", {
    method: "GET",
    csrf: false,
  });
}

export async function adminPatchMe(body: Record<string, unknown>): Promise<AdminUserResponse> {
  return browserApiRequest<AdminUserResponse>("/api/admin/me", {
    method: "PATCH",
    json: body,
  });
}

export async function adminMfaStart(): Promise<{ secret: string; qr_svg: string }> {
  return browserApiRequest<{ secret: string; qr_svg: string }>("/api/admin/me/mfa/start", {
    method: "POST",
  });
}

export async function adminMfaConfirm(code: string): Promise<{ recovery_codes: string[] }> {
  return browserApiRequest<{ recovery_codes: string[] }>("/api/admin/me/mfa/confirm", {
    method: "POST",
    json: { code },
  });
}

export async function adminMfaDisable(body: { password: string; code: string }): Promise<{ message: string }> {
  return browserApiRequest<{ message: string }>("/api/admin/me/mfa", {
    method: "DELETE",
    json: body,
  });
}

export async function adminSummary(): Promise<AdminSummaryResponse> {
  return browserApiRequest<AdminSummaryResponse>("/api/admin/dashboard/summary", {
    method: "GET",
    csrf: false,
  });
}

export async function adminSearch(q: string): Promise<{ data: { type: string; id: number; title: { ar?: string | null; en?: string | null }; href: string }[] }> {
  return browserApiRequest(`/api/admin/search?q=${encodeURIComponent(q)}`, {
    method: "GET",
    csrf: false,
  });
}

export async function adminUsers(): Promise<{
  data: AdminUser[];
  invitations: { id: number; name: string; email: string; role: string; expires_at: string; status: string }[];
  role_counts: Record<string, number>;
}> {
  return browserApiRequest("/api/admin/users", { method: "GET", csrf: false });
}

export async function adminInviteUser(body: { name: string; email: string; role: string }): Promise<unknown> {
  return browserApiRequest("/api/admin/users", { method: "POST", json: body });
}

export async function adminPatchUser(id: number, body: Record<string, unknown>): Promise<{ user: AdminUser }> {
  return browserApiRequest(`/api/admin/users/${id}`, { method: "PATCH", json: body });
}

export async function adminAuditLogs(query = ""): Promise<{
  data: { id: number; action: string; subject_type: string | null; subject_id: number | null; occurred_at: string; user: { name: string; email: string } | null }[];
  meta: { current_page: number; last_page: number; total: number };
}> {
  return browserApiRequest(`/api/admin/audit-logs${query}`, { method: "GET", csrf: false });
}

export async function adminProjects(q = ""): Promise<{ data: AdminProjectListItem[]; meta: { total: number } }> {
  const suffix = q ? `?q=${encodeURIComponent(q)}` : "";
  return browserApiRequest(`/api/admin/projects${suffix}`, { method: "GET", csrf: false });
}

export async function adminProject(id: number): Promise<AdminProjectDetail> {
  return browserApiRequest(`/api/admin/projects/${id}`, { method: "GET", csrf: false });
}

export async function adminPatchProject(id: number, body: Record<string, unknown>): Promise<AdminProjectDetail> {
  return browserApiRequest(`/api/admin/projects/${id}`, { method: "PATCH", json: body });
}

export async function adminPublishProject(id: number): Promise<AdminProjectDetail> {
  return browserApiRequest(`/api/admin/projects/${id}/publish`, { method: "POST" });
}

export async function adminDiscardProjectDraft(id: number): Promise<AdminProjectDetail> {
  return browserApiRequest(`/api/admin/projects/${id}/discard-draft`, { method: "POST" });
}

export async function adminProjectPreviewToken(id: number, locale: "ar" | "en"): Promise<{ token: string; path: string }> {
  return browserApiRequest(`/api/admin/projects/${id}/preview-token`, {
    method: "POST",
    json: { locale },
  });
}

export async function adminMedia(query = ""): Promise<{
  data: {
    id: number;
    url: string;
    path: string;
    original_filename: string | null;
    mime_type: string;
    size_bytes: number | null;
    import_key: string | null;
    references: { type: string; id: number; field: string }[];
  }[];
  meta: { total: number; current_page: number; last_page: number };
}> {
  return browserApiRequest(`/api/admin/media${query}`, { method: "GET", csrf: false });
}

export async function adminUploadMedia(file: File): Promise<{ data: { id: number } }> {
  await ensureSanctumCsrfCookie();
  const body = new FormData();
  body.append("file", file);
  return browserApiRequest("/api/admin/media", {
    method: "POST",
    formData: body,
  });
}

export async function adminResetUserMfa(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/users/${id}/reset-mfa`, { method: "POST" });
}

export async function adminRevokeUserSessions(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/users/${id}/revoke-sessions`, { method: "POST" });
}

export async function adminResendInvite(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/users/invitations/${id}/resend`, { method: "POST" });
}

export async function adminRevokeInvite(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/users/invitations/${id}/revoke`, { method: "POST" });
}

export async function adminMediaItem(id: number): Promise<{
  data: {
    id: number;
    url: string;
    path: string;
    original_filename: string | null;
    mime_type: string;
    size_bytes: number | null;
    alt: { ar?: string | null; en?: string | null } | null;
    caption: { ar?: string | null; en?: string | null } | null;
    references: { type: string; id: number; field: string }[];
  };
}> {
  return browserApiRequest(`/api/admin/media/${id}`, { method: "GET", csrf: false });
}

export async function adminPatchMedia(
  id: number,
  body: Record<string, unknown>,
): Promise<{ data: { id: number } }> {
  return browserApiRequest(`/api/admin/media/${id}`, { method: "PATCH", json: body });
}

export async function adminDeleteMedia(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/media/${id}`, { method: "DELETE" });
}

export async function adminForceDeleteMedia(id: number): Promise<{ message: string }> {
  return browserApiRequest(`/api/admin/media/${id}/force`, {
    method: "DELETE",
    json: { confirmation: "DELETE" },
  });
}
