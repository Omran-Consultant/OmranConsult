/** Profile-derived client and partner logos (Phase 4); replaced by API media in Phase 5. */

export type BrandLogo = {
  readonly src: string;
  /** Variant for dark surfaces when the artwork itself is dark (or white-only). */
  readonly onDarkSrc?: string;
  readonly width: number;
  readonly height: number;
};

export const CLIENT_LOGOS: Record<string, BrandLogo> = {
  "ministry-of-environment-water-and-agriculture": { src: "/images/clients/ministry-of-environment-water-and-agriculture.png", width: 480, height: 203 },
  "general-irrigation-organization": { src: "/images/clients/general-irrigation-organization.png", width: 480, height: 170 },
  "ministry-of-municipalities-and-housing": { src: "/images/clients/ministry-of-municipalities-and-housing.png", width: 480, height: 174 },
  "ministry-of-sport": { src: "/images/clients/ministry-of-sport.png", width: 479, height: 85 },
  "tatweer-buildings-company": { src: "/images/clients/tatweer-buildings-company.png", width: 480, height: 202 },
  "ministry-of-health": { src: "/images/clients/ministry-of-health.png", width: 480, height: 221 },
  "saudi-red-crescent-authority": { src: "/images/clients/saudi-red-crescent-authority.png", width: 480, height: 214 },
  "aramco": { src: "/images/clients/aramco.png", width: 480, height: 213 },
  "ministry-of-investment": { src: "/images/clients/ministry-of-investment.png", width: 479, height: 214 },
  "state-properties-general-authority": { src: "/images/clients/state-properties-general-authority.png", width: 480, height: 221 },
  "national-center-for-vegetation-cover-development": { src: "/images/clients/national-center-for-vegetation-cover-development.png", width: 480, height: 221 },
  "riyad-bank": { src: "/images/clients/riyad-bank.png", width: 480, height: 214 },
  "arasco": { src: "/images/clients/arasco.png", width: 480, height: 213 },
  "sdaia": { src: "/images/clients/sdaia.png", width: 479, height: 214 },
  "tawuniya": { src: "/images/clients/tawuniya.png", width: 480, height: 221 },
  "ministry-of-culture": { src: "/images/clients/ministry-of-culture.png", width: 480, height: 221 },
  "national-center-for-water-efficiency-and-conservation": { src: "/images/clients/national-center-for-water-efficiency-and-conservation.png", width: 480, height: 214 },
  "cargill": { src: "/images/clients/cargill.png", width: 480, height: 213 },
  "gosi": { src: "/images/clients/gosi.png", width: 479, height: 213 },
  "expro": { src: "/images/clients/expro.png", width: 480, height: 220 },
  "ministry-of-justice": { src: "/images/clients/ministry-of-justice.png", width: 480, height: 221 },
  "general-court-of-audit": { src: "/images/clients/general-court-of-audit.png", width: 480, height: 214 },
  "client-23": { src: "/images/clients/client-23.png", width: 480, height: 213 },
  "al-hayat-national-hospitals": { src: "/images/clients/al-hayat-national-hospitals.png", width: 479, height: 214 },
  "madinah-region-development-authority": { src: "/images/clients/madinah-region-development-authority.png", width: 480, height: 221 },
  "sekaya-charitable-foundation": { src: "/images/clients/sekaya-charitable-foundation.png", width: 480, height: 221 },
  "mrooj": { src: "/images/clients/mrooj.png", width: 480, height: 214 },
  "social-development-bank": { src: "/images/clients/social-development-bank.png", width: 480, height: 213 },
  "ministry-of-defense": { src: "/images/clients/ministry-of-defense.png", width: 479, height: 214 },
  "client-30": { src: "/images/clients/client-30.png", width: 480, height: 221 },
};

/*
 * Re-cropped from the profile p.42 at 400 dpi with transparency (PHASE4C_HOME_REVIEW H7). Oliver
 * Wyman is vector artwork in the PDF: a white and a navy rendering for dark and light surfaces.
 */
export const PARTNER_LOGOS: Record<string, BrandLogo> = {
  "oliver-wyman": { src: "/images/partners/oliver-wyman.png", onDarkSrc: "/images/partners/oliver-wyman-white.png", width: 480, height: 92 },
  "musanadah": { src: "/images/partners/musanadah.png", width: 480, height: 283 },
  "tacent": { src: "/images/partners/tacent.png", width: 440, height: 480 },
  "bureau-veritas": { src: "/images/partners/bureau-veritas.png", width: 386, height: 480 },
};

const CLIENT_LOGO_FALLBACK_PREFIX = "client-";

export function resolveClientLogoKey(slug: string | null | undefined, sortOrder: number): string {
  if (slug && slug in CLIENT_LOGOS) {
    return slug;
  }
  const fallback = `${CLIENT_LOGO_FALLBACK_PREFIX}${sortOrder}`;
  return fallback in CLIENT_LOGOS ? fallback : slug ?? fallback;
}

export function getClientLogo(slug: string | null | undefined, sortOrder: number): BrandLogo | undefined {
  const key = resolveClientLogoKey(slug, sortOrder);
  return CLIENT_LOGOS[key];
}

export function getPartnerLogo(slug: string | null | undefined): BrandLogo | undefined {
  if (!slug) {
    return undefined;
  }
  return PARTNER_LOGOS[slug];
}
