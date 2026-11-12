import type { AppLocale } from "@/i18n/routing";

type Label = readonly [ar: string, en: string];

type SectionMeta = {
  readonly title: Label;
  readonly hint: Label;
};

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

/** Human section names: where the text appears on the site — never internal CMS labels. */
const SECTIONS: Record<string, SectionMeta> = {
  "home.design_copy": {
    title: ["نصوص الصفحة الرئيسية — العناوين والدعوات", "Home page — titles and calls to action"],
    hint: ["العناوين الظاهرة في أعلى الصفحة وأقسامها ودعوة التواصل في الأسفل.", "Titles in the hero, section heads, and the bottom contact call to action."],
  },
  "home.about": {
    title: ["نصوص الصفحة الرئيسية — قسم من نحن", "Home page — About section"],
    hint: ["النص القصير تحت عنوان من نحن في الصفحة الرئيسية.", "The short About blurb on the home page."],
  },
  "home.education_goals": {
    title: ["نصوص الصفحة الرئيسية — أهدافنا", "Home page — Our goals"],
    hint: ["بطاقات الأهداف الظاهرة في الصفحة الرئيسية.", "Goal cards shown on the home page."],
  },
  "home.core_offerings": {
    title: ["نصوص الصفحة الرئيسية — الخدمات الأساسية", "Home page — Core offerings"],
    hint: ["عناوين ووصف الخدمات الأساسية في الصفحة الرئيسية.", "Titles and blurbs for the core offerings on Home."],
  },
  "home.flexible_model": {
    title: ["نصوص الصفحة الرئيسية — نموذج العمل المرن", "Home page — Flexible model"],
    hint: ["نقاط نموذج العمل المرن في الصفحة الرئيسية.", "Flexible-model points on the home page."],
  },
  "home.strategy": {
    title: ["نصوص الصفحة الرئيسية — الرؤية والرسالة والأهداف", "Home page — Vision, mission and objectives"],
    hint: ["بطاقات الرؤية والرسالة والأهداف في الصفحة الرئيسية.", "Vision, mission and objectives cards on Home."],
  },
  "home.credentials": {
    title: ["نصوص الصفحة الرئيسية — التراخيص والشهادات", "Home page — Licenses and certificates"],
    hint: ["عناوين ومقدمات قسم التراخيص والشهادات.", "Titles and intros for the licenses and certificates section."],
  },
  "home.work_stages": {
    title: ["نصوص الصفحة الرئيسية — مراحل العمل والتغطية", "Home page — Work stages and coverage"],
    hint: ["مراحل العمل ونص التغطية الجغرافية في الصفحة الرئيسية.", "Work stages and coverage copy on Home."],
  },
  "home.esg": {
    title: ["نصوص الصفحة الرئيسية — الحوكمة والاستدامة", "Home page — Governance and ESG"],
    hint: ["نص ومحاور الحوكمة والاستدامة في الصفحة الرئيسية.", "ESG intro and pillars on the home page."],
  },
  "home.engineering_design": {
    title: ["نصوص الصفحة الرئيسية — التصميم الهندسي", "Home page — Engineering design"],
    hint: ["نص قسم التصميم الهندسي في الصفحة الرئيسية.", "Engineering design section copy on Home."],
  },
  "home.multi_phase_approach": {
    title: ["نصوص الصفحة الرئيسية — منهجية المراحل المتعددة", "Home page — Multi-phase approach"],
    hint: ["خطوات ومخرجات المنهجية في الصفحة الرئيسية.", "Approach steps and outputs on Home."],
  },
  "home.section_titles": {
    title: ["نصوص الصفحة الرئيسية — العناوين الصغيرة", "Home page — small section titles"],
    hint: ["العناوين القصيرة فوق أقسام الخبراء والهيكل والإحصاءات والمشاريع المميزة.", "Short titles above experts, org chart, statistics and featured projects."],
  },
  "home.service_highlights": {
    title: ["نصوص الصفحة الرئيسية — بطاقات الخدمات", "Home page — service cards"],
    hint: ["عناوين ووصف الروابط في شبكة بطاقات الخدمات الست.", "Titles and blurbs on the six home service cards."],
  },
  "home.tools": {
    title: ["نصوص الصفحة الرئيسية — الأدوات والممكنات", "Home page — Tools and enablers"],
    hint: ["عناوين أدوات وممكنات الصفحة الرئيسية.", "Tools and enablers titles on Home."],
  },
  "about.design_copy": {
    title: ["نصوص صفحة من نحن — العناوين الصغيرة", "About page — small titles and section heads"],
    hint: ["عناوين أقسام صفحة من نحن ودعواتها الظاهرة للزائر.", "Section heads and calls to action the visitor sees on About."],
  },
  "services.design_copy": {
    title: ["نصوص صفحة الخدمات — العناوين والأقسام", "Services page — titles and sections"],
    hint: ["عناوين أعلى الصفحة وأقسام الخدمات الظاهرة للزائر.", "Hero and section titles on the Services page."],
  },
  "projects.design_copy": {
    title: ["نصوص صفحة المشاريع — العناوين وتفاصيل المشروع", "Projects page — titles and project detail"],
    hint: ["عنوان قائمة المشاريع ونصوص صفحة تفاصيل المشروع.", "Projects list hero and project-detail copy."],
  },
  "contact.design_copy": {
    title: ["نصوص صفحة تواصل معنا — العنوان والنموذج", "Contact page — title and form"],
    hint: ["عنوان الصفحة ونص المقدمة وعنوان نموذج التواصل.", "Page title, intro and contact form heading."],
  },
  "media.design_copy": {
    title: ["نصوص المركز الإعلامي — العنوان والنشرة", "Media Center — title and newsletter"],
    hint: ["عنوان المركز الإعلامي والمقدمة ونصوص النشرة ودعوة نهاية المقال.", "Media Center title, intro, newsletter and article CTA."],
  },
  "layout.design_copy": {
    title: ["نصوص التذييل — الظاهر في كل الصفحات", "Footer copy — shown on every page"],
    hint: ["نبذة التذييل ونص النشرة البريدية والشعار النصي.", "Footer about blurb, newsletter text and tagline."],
  },
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

/**
 * Field keys that rarely change (Latin overlines, links, icons) — shown under «إعدادات متقدمة».
 */
export const ADVANCED_FIELD_KEYS = new Set([
  "overline",
  "overline_short",
  "overview_overline",
  "related_overline",
  "href",
  "icon",
  "link_short",
  "intro_short",
  "title_short",
  "text_short",
  "lead_short",
  "short_labels",
]);

/**
 * Keys the public site renders through `AccentText` (section headers, page and Home heroes, CTA
 * boxes): only these offer «تمييز الكلمة». List items never do. A field that already stores an
 * `{accent}` marker keeps the controls so the highlight can still be removed.
 */
export const ACCENT_FIELD_KEYS = new Set([
  "headline",
  "heading",
  "title",
  "title_short",
  "section_title",
  "overview_title",
  "related_title",
]);

/**
 * Preferred order of nested groups inside a block, matching the public page top-to-bottom.
 * Unknown keys keep their stored order after the listed ones.
 */
export const SECTION_GROUP_ORDER: Record<string, readonly string[]> = {
  "home.design_copy": ["hero", "about", "stats", "services", "projects", "coverage", "trust", "cta"],
  "about.design_copy": [
    "hero",
    "intro",
    "education_goals",
    "strategy",
    "work_stages",
    "experts",
    "org_chart",
    "clients",
    "partners",
    "licenses",
    "esg",
  ],
  "services.design_copy": ["hero", "offerings", "pillars", "asset_management", "engineering", "approach", "tools"],
  "projects.design_copy": ["hero", "detail"],
  "contact.design_copy": ["overline", "title", "intro", "intro_short", "form_title"],
  "media.design_copy": ["title", "intro", "newsletter", "article_cta"],
  "layout.design_copy": ["footer"],
  "home.work_stages": ["stages", "coverage"],
  "home.multi_phase_approach": ["section_title", "steps", "outputs"],
  "home.strategy": ["vision", "mission", "objectives"],
  "home.esg": ["section_title", "body", "pillars"],
  "home.credentials": ["licenses_title", "licenses_intro", "certificates_title", "certificates_intro"],
};

function pick(map: Record<string, Label>, key: string, locale: AppLocale, fallback: Label): string {
  const label = map[key] ?? fallback;
  return locale === "ar" ? label[0] : label[1];
}

function pickMeta(page: string, sectionKey: string): SectionMeta | undefined {
  return SECTIONS[`${page}.${sectionKey}`] ?? SECTIONS[sectionKey];
}

export function fieldLabel(key: string, locale: AppLocale): string {
  return pick(FIELDS, key, locale, ["حقل", "Field"]);
}

export function pageLabel(page: string, locale: AppLocale): string {
  return pick(PAGES, page, locale, ["صفحة", "Page"]);
}

/** Plain name of where the section appears on the site. Pass the page when known. */
export function sectionLabel(sectionKey: string, locale: AppLocale, page?: string): string {
  const meta = page ? pickMeta(page, sectionKey) : SECTIONS[sectionKey];
  if (meta) {
    return locale === "ar" ? meta.title[0] : meta.title[1];
  }
  return pick({}, sectionKey, locale, ["قسم", "Section"]);
}

export function sectionHint(page: string, sectionKey: string, locale: AppLocale): string | undefined {
  const meta = pickMeta(page, sectionKey);
  if (!meta) {
    return undefined;
  }
  return locale === "ar" ? meta.hint[0] : meta.hint[1];
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

/** Sort object entries by a preferred key order; unknown keys keep relative order at the end. */
export function sortEntriesByOrder<T>(entries: readonly (readonly [string, T])[], order: readonly string[] | undefined): (readonly [string, T])[] {
  if (!order || order.length === 0) {
    return [...entries];
  }
  const rank = new Map(order.map((key, index) => [key, index]));
  return [...entries].sort((a, b) => {
    const left = rank.get(a[0]);
    const right = rank.get(b[0]);
    if (left === undefined && right === undefined) {
      return 0;
    }
    if (left === undefined) {
      return 1;
    }
    if (right === undefined) {
      return -1;
    }
    return left - right;
  });
}
