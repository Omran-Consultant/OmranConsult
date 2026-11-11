import type { AppLocale } from "@/i18n/routing";

const AR: Record<string, string> = {
  login_succeeded: "سجّل الدخول",
  login_failed: "فشل تسجيل الدخول",
  draft_saved: "حفظ مسودة",
  draft_discarded: "تجاهل مسودة",
  project_published: "نشر مشروعاً",
  project_updated: "حدّث مشروعاً",
  user_invited: "دعا مستخدماً",
  user_invite_resent: "أعاد إرسال دعوة",
  user_invite_revoked: "ألغى دعوة",
  invite_accepted: "قبل دعوة",
  mfa_enabled: "فعّل المصادقة الثنائية",
  mfa_disabled: "عطّل المصادقة الثنائية",
  media_uploaded: "رفع ملفاً",
  media_deleted: "حذف ملفاً",
  media_force_deleted: "حذف ملفاً نهائياً",
  revalidation_failed: "فشلت إعادة التحقق من الموقع",
  content_block_updated: "حدّث قسماً في صفحة",
  content_block_published: "نشر قسماً في صفحة",
  hero_slide_updated: "حدّث شريحة",
  hero_slide_published: "نشر شريحة",
  statistic_updated: "حدّث إحصائية",
  statistic_published: "نشر إحصائية",
  home_sectors_updated: "نشر ترتيب قطاعات الرئيسية",
};

const EN: Record<string, string> = {
  login_succeeded: "Signed in",
  login_failed: "Sign-in failed",
  draft_saved: "Saved a draft",
  draft_discarded: "Discarded a draft",
  project_published: "Published a project",
  project_updated: "Updated a project",
  user_invited: "Invited a user",
  user_invite_resent: "Resent an invitation",
  user_invite_revoked: "Revoked an invitation",
  invite_accepted: "Accepted an invitation",
  mfa_enabled: "Enabled MFA",
  mfa_disabled: "Disabled MFA",
  media_uploaded: "Uploaded a file",
  media_deleted: "Deleted a file",
  media_force_deleted: "Permanently deleted a file",
  revalidation_failed: "Frontend revalidation failed",
  content_block_updated: "Updated a page section",
  content_block_published: "Published a page section",
  hero_slide_updated: "Updated a slide",
  hero_slide_published: "Published a slide",
  statistic_updated: "Updated a statistic",
  statistic_published: "Published a statistic",
  home_sectors_updated: "Published the Home sectors order",
};

export function labelAuditAction(action: string, locale: AppLocale): string {
  const map = locale === "ar" ? AR : EN;
  return map[action] ?? (locale === "ar" ? "نشاط على النظام" : "System activity");
}
