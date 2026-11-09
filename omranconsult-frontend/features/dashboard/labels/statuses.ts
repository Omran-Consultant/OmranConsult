import type { AppLocale } from "@/i18n/routing";

const AR: Record<string, string> = {
  published: "منشور",
  draft: "مسودة",
  published_with_draft: "منشور مع تعديلات",
  trashed: "في السلة",
  new: "جديد",
  read: "مقروء",
  archived: "مؤرشف",
  pending: "معلّق",
};

const EN: Record<string, string> = {
  published: "Published",
  draft: "Draft",
  published_with_draft: "Published with changes",
  trashed: "Trashed",
  new: "New",
  read: "Read",
  archived: "Archived",
  pending: "Pending",
};

export function labelContentStatus(status: string, locale: AppLocale): string {
  const map = locale === "ar" ? AR : EN;
  return map[status] ?? status;
}
