import type { ImageAsset } from "@/core/ui/image-asset";
import type { AppLocale } from "@/i18n/routing";

type LocalizedAlt = {
  readonly ar: string;
  readonly en: string;
};

export type ProfileImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly alt: LocalizedAlt;
};

type ImageKey =
  | "xAbdelalim"
  | "xAmira"
  | "xBassam"
  | "xMosaad"
  | "xMuqbil"
  | "xWaseem";

export const PROFILE_IMAGES: Record<ImageKey, ProfileImage> = {
  xAbdelalim: {
    src: "/images/profile/x-abdelalim.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبير محمد عبدالعليم",
      en: "Portrait of expert Mohammed Abdelalim",
    },
  },
  xAmira: {
    src: "/images/profile/x-amira.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبيرة أميرة البرتقالي",
      en: "Portrait of expert Amira Al-Burtuqali",
    },
  },
  xBassam: {
    src: "/images/profile/x-bassam.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبير بسام جورية",
      en: "Portrait of expert Bassam Jouriyeh",
    },
  },
  xMosaad: {
    src: "/images/profile/x-mosaad.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبير محمد مساعد",
      en: "Portrait of expert Mohammed Mosaad",
    },
  },
  xMuqbil: {
    src: "/images/profile/x-muqbil.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبير عبدالرحمن المقبل",
      en: "Portrait of expert Abdulrahman Al-Muqbil",
    },
  },
  xWaseem: {
    src: "/images/profile/x-waseem.jpg",
    width: 480,
    height: 600,
    alt: {
      ar: "صورة شخصية للخبير وسيم أسفهان",
      en: "Portrait of expert Waseem Asfahan",
    },
  },
} as const;

export const EXPERT_PORTRAITS = {
  "mohammed-mosaad": PROFILE_IMAGES.xMosaad,
  "bassam-jouriyeh": PROFILE_IMAGES.xBassam,
  "mohammed-abdelalim": PROFILE_IMAGES.xAbdelalim,
  "abdulrahman-al-muqbil": PROFILE_IMAGES.xMuqbil,
  "waseem-asfahan": PROFILE_IMAGES.xWaseem,
  "amira-al-burtuqali": PROFILE_IMAGES.xAmira,
} as const;

/*
 * Figma handoff photos (03-Assets/images; file names equal the Figma `img/*` layers).
 * Phase 4C registry; replaced by API media in Phase 5.
 */
const site = (name: string, width: number, height: number, ar: string, en: string): ProfileImage => ({
  src: `/images/site/${name}.jpg`,
  width,
  height,
  alt: { ar, en },
});

export const SITE_IMAGES = {
  aerial: site("aerial", 1801, 1168, "منظر جوي لأبراج حي الملك عبدالله المالي في الرياض", "Aerial view of the King Abdullah Financial District towers in Riyadh"),
  building: site("building", 1672, 940, "واجهة مبنى حديث بألواح زجاجية عمودية", "Modern building facade with vertical glass fins"),
  cad: site("cad", 1672, 941, "مهندس يراجع نموذجاً ثلاثي الأبعاد لمبنى على الشاشة", "Engineer reviewing a 3D building model on screen"),
  control: site("control", 1500, 844, "مهندسة تعمل على مخططات هندسية في مكتب حديث", "Engineer working on technical drawings in a modern office"),
  digital: site("digital", 1776, 994, "شخص يعمل على حاسوب محمول أمام واجهة بيانات رقمية", "Person working on a laptop in front of a digital data display"),
  earth: site("earth", 2400, 1200, "الكرة الأرضية من الفضاء تظهر شبه الجزيرة العربية", "Earth from space showing the Arabian Peninsula"),
  earth2: site("earth2", 2400, 1200, "الكرة الأرضية ليلاً تظهر أضواء شبه الجزيرة العربية", "Earth at night showing the lights of the Arabian Peninsula"),
  engineer: site("engineer", 1536, 1024, "مهندس بخوذة السلامة يحمل جهازاً لوحياً أمام أفق الرياض", "Engineer in a hard hat holding a tablet against the Riyadh skyline"),
  experts: site("experts", 1624, 339, "صور خبراء شركة العمران المتقدم", "Portraits of OMRAN Advanced Company experts"),
  facade: site("facade", 1672, 941, "واجهة زجاجية زرقاء لمبنى حديث", "Blue glass facade of a modern building"),
  handshake: site("handshake", 1000, 375, "مصافحة شراكة فوق مشهد صناعي", "Partnership handshake over an industrial scene"),
  ksamap: site("ksamap", 1536, 1024, "خريطة مناطق المملكة العربية السعودية", "Map of the regions of Saudi Arabia"),
  night: site("night", 2292, 1527, "أفق الرياض ليلاً مع تقاطعات الطرق المضيئة", "Riyadh skyline at night with lit highway interchanges"),
  riyadhTeal: site("riyadh_teal", 1672, 941, "أفق الرياض وبرج المملكة عند الغسق", "Riyadh skyline and Kingdom Centre at dusk"),
  site: site("site", 2053, 2060, "مهندس موقع بخوذة صفراء أمام منشأة صناعية", "Site engineer in a yellow hard hat facing an industrial plant"),
  sunset: site("sunset", 1000, 667, "أبراج الرياض وخط المترو عند الغروب", "Riyadh towers and the metro line at sunset"),
  tablet: site("tablet", 1672, 940, "مهندس يتابع لوحة تحكم رقمية على جهاز لوحي في منشأة تشغيلية", "Engineer monitoring a digital control panel on a tablet in a plant"),
  team: site("team", 2048, 1367, "فريق عمل حول طاولة اجتماعات بأجهزة محمولة", "Team around a meeting table with laptops"),
  truss: site("truss", 1673, 940, "هيكل إنشائي معدني دائري من الأعلى", "Circular steel structure seen from above"),
  wave: site("wave", 1672, 941, "مبنى بسقف موجي وأبراج حديثة عند الغروب", "Building with a wave-shaped roof and modern towers at sunset"),
  worldmap: site("worldmap", 1672, 941, "خريطة عالمية رقمية تبرز المملكة العربية السعودية", "Digital world map highlighting Saudi Arabia"),
} as const satisfies Record<string, ProfileImage>;

export type SiteImageKey = keyof typeof SITE_IMAGES;

/** Resolves alt text for the active locale (core/ui components take a plain ImageAsset). */
export function toImageAsset(image: ProfileImage, locale: AppLocale): ImageAsset {
  return { src: image.src, width: image.width, height: image.height, alt: image.alt[locale] };
}

/** API image keys use the Figma file names (for example `riyadh_teal`). */
export function getSiteImage(key: string | null | undefined): ProfileImage | undefined {
  if (!key) {
    return undefined;
  }
  const camel = key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
  return camel in SITE_IMAGES ? SITE_IMAGES[camel as SiteImageKey] : undefined;
}
