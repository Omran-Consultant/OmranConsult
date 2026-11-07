/**
 * Public navigation (PHASE4C §3). Labels live in messages under Layout.nav / Layout.footer.
 * «الشهادات» has no page of its own and points at the About credentials section.
 * Careers stays hidden (A19).
 */
export const PRIMARY_NAV_ITEMS = [
  { href: "/", messageKey: "home" },
  { href: "/about", messageKey: "about" },
  { href: "/services", messageKey: "services" },
  { href: "/projects", messageKey: "projects" },
  { href: "/about#credentials", messageKey: "certificates" },
  { href: "/media", messageKey: "media" },
] as const;

/** The mobile menu lists the primary links plus Contact (Figma "Mobile Menu — Open"). */
export const MOBILE_NAV_ITEMS = [...PRIMARY_NAV_ITEMS, { href: "/contact", messageKey: "contact" }] as const;

export const CONTACT_HREF = "/contact";

type FooterLink = { readonly href: string; readonly messageKey: string };

/** Desktop and tablet footer columns (Figma Footer). Every link has a real target. */
export const FOOTER_COLUMNS = {
  company: [
    { href: "/about", messageKey: "about" },
    { href: "/about#strategy", messageKey: "vision" },
    { href: "/about#org-chart", messageKey: "orgChart" },
    { href: "/about#credentials", messageKey: "credentials" },
  ],
  services: [
    { href: "/services#asset-management", messageKey: "assetManagement" },
    { href: "/services#pillars", messageKey: "engineeringConsulting" },
    { href: "/services#engineering", messageKey: "engineeringDesign" },
    { href: "/services#pillars", messageKey: "digitalTransformation" },
  ],
} as const satisfies Record<string, readonly FooterLink[]>;

/** Mobile footer columns (Figma Footer, 390). */
export const FOOTER_COLUMNS_COMPACT = {
  company: [
    { href: "/about", messageKey: "about" },
    { href: "/projects", messageKey: "projects" },
    { href: "/about#credentials", messageKey: "certificates" },
  ],
  services: [
    { href: "/services#asset-management", messageKey: "assetManagementShort" },
    { href: "/services#pillars", messageKey: "consultingShort" },
    { href: "/services#pillars", messageKey: "digitalTransformation" },
  ],
} as const satisfies Record<string, readonly FooterLink[]>;

/** Routes whose first section is a photo hero: the header starts transparent over it. */
const PHOTO_HERO_PATTERNS = [/^\/$/, /^\/about$/, /^\/services$/, /^\/projects$/, /^\/projects\/[^/]+$/];

export function hasPhotoHero(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return PHOTO_HERO_PATTERNS.some((pattern) => pattern.test(path));
}

/** A link is active on its own page (home only on "/"); hash links never are. */
export function isActiveNavHref(href: string, pathname: string): boolean {
  if (href.includes("#")) {
    return false;
  }
  const path = pathname.replace(/\/+$/, "") || "/";
  return href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
}
