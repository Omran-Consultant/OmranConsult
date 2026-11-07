export const PRIMARY_NAV_ITEMS = [
  { href: "/", messageKey: "home" },
  { href: "/about", messageKey: "about" },
  { href: "/services", messageKey: "services" },
  { href: "/projects", messageKey: "projects" },
  // U26/A19: careers stays hidden until Phase 4B.
  { href: "/#contact", messageKey: "contact" },
] as const;

export const FOOTER_QUICK_LINKS = [
  { href: "/", messageKey: "home" },
  { href: "/about", messageKey: "about" },
  { href: "/services", messageKey: "services" },
  { href: "/projects", messageKey: "projects" },
  { href: "/#contact", messageKey: "contact" },
] as const;
