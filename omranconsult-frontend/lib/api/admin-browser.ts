import {
  browserApiRequest,
  ensureSanctumCsrfCookie,
} from "@/lib/api/browser-client";
import type {
  AdminLoginRequest,
  AdminLogoutResponse,
  AdminUserResponse,
} from "@/lib/api/types";

export { ensureSanctumCsrfCookie };

export async function adminLogin(
  credentials: AdminLoginRequest,
): Promise<AdminUserResponse> {
  await ensureSanctumCsrfCookie();

  return browserApiRequest<AdminUserResponse>("/api/admin/login", {
    method: "POST",
    json: credentials,
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
