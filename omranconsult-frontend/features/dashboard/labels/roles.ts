import type { AppLocale } from "@/i18n/routing";

export function labelRole(role: string, locale: AppLocale): string {
  if (role === "super_admin") {
    return locale === "ar" ? "مدير النظام" : "Super admin";
  }
  if (role === "editor") {
    return locale === "ar" ? "محرر المحتوى" : "Content editor";
  }

  return locale === "ar" ? "مستخدم" : "User";
}
