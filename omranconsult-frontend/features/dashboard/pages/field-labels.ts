import type { AppLocale } from "@/i18n/routing";

type Label = readonly [ar: string, en: string];

/**
 * Names for the keys inside content block payloads, so the editor never shows a raw key.
 * The keys are the seeded ones (database/seeders); an unknown key falls back to a neutral name.
 */
const FIELDS: Record<string, Label> = {
  about: ["من نحن", "About"],
  approach: ["المنهجية", "Approach"],
  article_cta: ["دعوة نهاية المقال", "Article call to action"],
  asset_management: ["إدارة الأصول", "Asset management"],
  badge_label: ["نص الشارة", "Badge text"],
  board: ["مجلس الإدارة", "Board of directors"],
  board_committees: ["لجان مجلس الإدارة", "Board committees"],
  body: ["النص", "Text"],
  certificates_intro: ["مقدمة الشهادات", "Certificates intro"],
  certificates_title: ["عنوان الشهادات", "Certificates title"],
  clients: ["العملاء", "Clients"],
  committees: ["اللجان", "Committees"],
  completed_projects: ["المشاريع المنجزة", "Completed projects"],
  coverage: ["التغطية", "Coverage"],
  cta: ["الدعوة إلى التواصل", "Call to action"],
  cta_primary: ["الزر الأساسي", "Primary button"],
  cta_secondary: ["الزر الثانوي", "Secondary button"],
  description: ["الوصف", "Description"],
  detail: ["صفحة تفاصيل المشروع", "Project detail page"],
  education_goals: ["أهدافنا", "Our goals"],
  employees: ["الموظفون", "Employees"],
  engineering: ["التصميم الهندسي", "Engineering design"],
  esg: ["الحوكمة والاستدامة", "Governance and ESG"],
  executive_management: ["الإدارة التنفيذية", "Executive management"],
  experts: ["الخبراء", "Experts"],
  featured_projects: ["المشاريع المميزة", "Featured projects"],
  features: ["المزايا", "Features"],
  footer: ["التذييل", "Footer"],
  form_title: ["عنوان النموذج", "Form title"],
  group_experience: ["خبرة المجموعة", "Group experience"],
  heading: ["العنوان", "Heading"],
  headline: ["العنوان الرئيسي", "Headline"],
  hero: ["أعلى الصفحة", "Page hero"],
  href: ["الرابط الداخلي", "Internal link"],
  icon: ["الأيقونة", "Icon"],
  inquiry_text: ["نص بطاقة الاستفسار", "Inquiry card text"],
  inquiry_title: ["عنوان بطاقة الاستفسار", "Inquiry card title"],
  intro: ["المقدمة", "Intro"],
  intro_short: ["المقدمة (الجوال)", "Intro (mobile)"],
  items: ["العناصر", "Items"],
  lead: ["الكلمة الافتتاحية", "Lead word"],
  lead_short: ["النص التمهيدي (الجوال)", "Lead text (mobile)"],
  licenses: ["التراخيص", "Licenses"],
  licenses_intro: ["مقدمة التراخيص", "Licenses intro"],
  licenses_title: ["عنوان التراخيص", "Licenses title"],
  link: ["نص الرابط", "Link text"],
  link_short: ["نص الرابط (الجوال)", "Link text (mobile)"],
  local_content: ["المحتوى المحلي", "Local content"],
  mission: ["الرسالة", "Mission"],
  newsletter: ["النشرة البريدية", "Newsletter"],
  newsletter_text: ["نص النشرة البريدية", "Newsletter text"],
  number: ["الرقم", "Number"],
  objectives: ["الأهداف", "Objectives"],
  offerings: ["الخدمات الأساسية", "Core offerings"],
  org_chart: ["الهيكل التنظيمي", "Organizational chart"],
  org_groups: ["مجموعات الهيكل التنظيمي", "Organizational chart groups"],
  outputs: ["المخرجات", "Outputs"],
  overline: ["العنوان العلوي (لاتيني)", "Overline (Latin)"],
  overline_short: ["العنوان العلوي (الجوال)", "Overline (mobile)"],
  overview_overline: ["العنوان العلوي للنبذة", "Overview overline"],
  overview_title: ["عنوان النبذة", "Overview title"],
  partners: ["الشركاء", "Partners"],
  partners_label: ["عنوان الشركاء", "Partners label"],
  partnerships: ["الشراكات", "Partnerships"],
  pillars: ["المحاور", "Pillars"],
  planning_control: ["التخطيط والمتابعة", "Planning and control"],
  primary: ["الزر الأساسي", "Primary button"],
  project_volume: ["حجم المشاريع", "Project volume"],
  projects: ["المشاريع", "Projects"],
  related_overline: ["العنوان العلوي للمشاريع ذات الصلة", "Related projects overline"],
  related_title: ["عنوان المشاريع ذات الصلة", "Related projects title"],
  scope_title: ["عنوان نطاق العمل", "Scope title"],
  secondary: ["الزر الثانوي", "Secondary button"],
  section_title: ["عنوان القسم", "Section title"],
  services: ["الخدمات", "Services"],
  short_labels: ["تسميات الإحصاءات (الجوال)", "Statistic labels (mobile)"],
  side_text: ["النص الجانبي", "Side text"],
  stages: ["المراحل", "Stages"],
  stat_labels: ["تسميات الإحصاءات", "Statistic labels"],
  statistics: ["الإحصاءات", "Statistics"],
  stats: ["الأرقام", "Numbers"],
  steps: ["الخطوات", "Steps"],
  strategy: ["الاستراتيجية", "Strategy"],
  subtitle: ["العنوان الفرعي", "Subtitle"],
  tagline: ["الشعار النصي", "Tagline"],
  text: ["النص", "Text"],
  text_short: ["النص (الجوال)", "Text (mobile)"],
  title: ["العنوان", "Title"],
  title_short: ["العنوان (الجوال)", "Title (mobile)"],
  tools: ["الأدوات والممكنات", "Tools and enablers"],
  trust: ["الثقة والاعتمادات", "Trust and credentials"],
  vision: ["الرؤية", "Vision"],
  work_stages: ["مراحل العمل", "Work stages"],
  years_experience: ["سنوات الخبرة", "Years of experience"],
};

const PAGES: Record<string, Label> = {
  home: ["الصفحة الرئيسية", "Home"],
  about: ["من نحن", "About"],
  services: ["الخدمات", "Services"],
  projects: ["المشاريع", "Projects"],
  contact: ["تواصل معنا", "Contact"],
  media: ["المركز الإعلامي", "Media Center"],
  layout: ["التذييل والعناصر المشتركة", "Footer and shared elements"],
};

const SECTIONS: Record<string, Label> = {
  design_copy: ["نصوص التصميم", "Design copy"],
  about: ["من نحن (نص البروفايل)", "About (profile text)"],
  education_goals: ["أهدافنا", "Our goals"],
  core_offerings: ["الخدمات الأساسية", "Core offerings"],
  flexible_model: ["نموذج العمل المرن", "Flexible model"],
  strategy: ["الرؤية والرسالة والأهداف", "Vision, mission and objectives"],
  credentials: ["التراخيص والشهادات", "Licenses and certificates"],
  work_stages: ["مراحل العمل والتغطية", "Work stages and coverage"],
  esg: ["الحوكمة والاستدامة", "Governance and ESG"],
  engineering_design: ["التصميم الهندسي", "Engineering design"],
  multi_phase_approach: ["منهجية المراحل المتعددة", "Multi-phase approach"],
  section_titles: ["عناوين الأقسام", "Section titles"],
  service_highlights: ["بطاقات الخدمات في الرئيسية", "Home service cards"],
};

const SLIDES: Record<string, Label> = {
  cover: ["الغلاف", "Cover"],
  hero: ["الشريحة الرئيسية", "Main slide"],
  integrated_solutions: ["الحلول المتكاملة", "Integrated solutions"],
  projects: ["المشاريع", "Projects"],
  projects_map: ["خريطة المشاريع", "Projects map"],
  vision: ["الرؤية", "Vision"],
  certifications: ["الشهادات", "Certifications"],
  governance: ["الحوكمة", "Governance"],
  services: ["الخدمات", "Services"],
  asset_management: ["إدارة الأصول", "Asset management"],
  engineering: ["التصميم الهندسي", "Engineering design"],
  approach: ["المنهجية", "Approach"],
  partners: ["الشركاء", "Partners"],
  clients: ["العملاء", "Clients"],
};

/** Public path of each page, for the «عرض الصفحة» link. Shared layout text shows on every page. */
export const PAGE_PATHS: Record<string, string> = {
  home: "",
  about: "/about",
  services: "/services",
  projects: "/projects",
  contact: "/contact",
  media: "/media",
  layout: "",
};

function pick(map: Record<string, Label>, key: string, locale: AppLocale, fallback: Label): string {
  const label = map[key] ?? fallback;
  return locale === "ar" ? label[0] : label[1];
}

export function fieldLabel(key: string, locale: AppLocale): string {
  return pick(FIELDS, key, locale, ["حقل", "Field"]);
}

export function pageLabel(page: string, locale: AppLocale): string {
  return pick(PAGES, page, locale, ["صفحة", "Page"]);
}

export function sectionLabel(sectionKey: string, locale: AppLocale): string {
  return pick(SECTIONS, sectionKey, locale, ["قسم", "Section"]);
}

export function slideLabel(key: string, locale: AppLocale): string {
  return pick(SLIDES, key, locale, ["شريحة", "Slide"]);
}

export function statisticLabel(key: string, locale: AppLocale): string {
  return pick(FIELDS, key, locale, ["إحصائية", "Statistic"]);
}

export function itemLabel(index: number, locale: AppLocale): string {
  return locale === "ar" ? `العنصر ${index + 1}` : `Item ${index + 1}`;
}

/** «أعلى الصفحة ← العنوان» for a publish blocker path. */
export function pathLabel(path: readonly (string | number)[], locale: AppLocale): string {
  return path.map((part) => (typeof part === "number" ? itemLabel(part, locale) : fieldLabel(part, locale))).join(locale === "ar" ? " ← " : " → ");
}

export function hasFieldLabel(key: string): boolean {
  return key in FIELDS;
}
