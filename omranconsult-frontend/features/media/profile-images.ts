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
  | "blueprint"
  | "cad"
  | "campus"
  | "clarifier"
  | "earth"
  | "engineerSkyline"
  | "facade"
  | "kafd"
  | "network"
  | "partners"
  | "plant"
  | "riyadhDay"
  | "riyadhNight"
  | "team"
  | "xAbdelalim"
  | "xAmira"
  | "xBassam"
  | "xMosaad"
  | "xMuqbil"
  | "xWaseem";

const PROFILE_IMAGES: Record<ImageKey, ProfileImage> = {
  blueprint: {
    src: "/images/profile/blueprint.jpg",
    width: 1500,
    height: 844,
    alt: {
      ar: "مخططات هندسية على طاولة عمل",
      en: "Engineering blueprints on a work table",
    },
  },
  cad: {
    src: "/images/profile/cad.jpg",
    width: 1672,
    height: 941,
    alt: {
      ar: "مهندس يعمل على شاشة تصميم هندسي",
      en: "Engineer working on a CAD design screen",
    },
  },
  campus: {
    src: "/images/profile/campus.jpg",
    width: 1672,
    height: 940,
    alt: {
      ar: "مبنى تعليمي حديث ضمن حرم جامعي",
      en: "Modern educational building in a campus setting",
    },
  },
  clarifier: {
    src: "/images/profile/clarifier.jpg",
    width: 1673,
    height: 940,
    alt: {
      ar: "منشأة معالجة مياه دائرية من الأعلى",
      en: "Aerial view of a circular water-treatment facility",
    },
  },
  earth: {
    src: "/images/profile/earth.jpg",
    width: 1920,
    height: 960,
    alt: {
      ar: "صورة بانورامية للأرض من الفضاء",
      en: "Panoramic image of Earth from space",
    },
  },
  engineerSkyline: {
    src: "/images/profile/engineer-skyline.jpg",
    width: 1536,
    height: 1024,
    alt: {
      ar: "مهندس ينظر إلى أفق المدينة",
      en: "Engineer looking toward a city skyline",
    },
  },
  facade: {
    src: "/images/profile/facade.jpg",
    width: 1672,
    height: 941,
    alt: {
      ar: "واجهة مبنى حديثة بتفاصيل هندسية",
      en: "Modern building facade with structural details",
    },
  },
  kafd: {
    src: "/images/profile/kafd.jpg",
    width: 1672,
    height: 941,
    alt: {
      ar: "مشهد حضري لمبان حديثة في الرياض",
      en: "Urban view of modern towers in Riyadh",
    },
  },
  network: {
    src: "/images/profile/network.jpg",
    width: 1672,
    height: 941,
    alt: {
      ar: "شبكة خطوط مضيئة ترمز للربط الرقمي",
      en: "Luminous network lines representing digital connectivity",
    },
  },
  partners: {
    src: "/images/profile/partners.jpg",
    width: 1000,
    height: 375,
    alt: {
      ar: "مصافحة ترمز إلى الشراكة المهنية",
      en: "Handshake symbolizing professional partnership",
    },
  },
  plant: {
    src: "/images/profile/plant.jpg",
    width: 1672,
    height: 940,
    alt: {
      ar: "منشأة صناعية مع معدات تشغيل",
      en: "Industrial facility with operating equipment",
    },
  },
  riyadhDay: {
    src: "/images/profile/riyadh-day.jpg",
    width: 1801,
    height: 1168,
    alt: {
      ar: "أفق الرياض نهارا مع برج المملكة",
      en: "Riyadh skyline by day with Kingdom Centre",
    },
  },
  riyadhNight: {
    src: "/images/profile/riyadh-night.jpg",
    width: 2000,
    height: 1335,
    alt: {
      ar: "أفق الرياض ليلا بإضاءة الأبراج",
      en: "Riyadh skyline at night with illuminated towers",
    },
  },
  team: {
    src: "/images/profile/team.jpg",
    width: 2000,
    height: 1335,
    alt: {
      ar: "فريق عمل يتناقش في اجتماع",
      en: "Professional team collaborating in a meeting",
    },
  },
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

export const HERO_SLIDE_IMAGES = {
  cover: PROFILE_IMAGES.earth,
  hero: PROFILE_IMAGES.earth,
} as const;

export const EXPERT_PORTRAITS = {
  "mohammed-mosaad": PROFILE_IMAGES.xMosaad,
  "bassam-jouriyeh": PROFILE_IMAGES.xBassam,
  "mohammed-abdelalim": PROFILE_IMAGES.xAbdelalim,
  "abdulrahman-al-muqbil": PROFILE_IMAGES.xMuqbil,
  "waseem-asfahan": PROFILE_IMAGES.xWaseem,
  "amira-al-burtuqali": PROFILE_IMAGES.xAmira,
} as const;

export const SECTION_BACKGROUND_IMAGES = {
  about: PROFILE_IMAGES.engineerSkyline,
  strategy: PROFILE_IMAGES.kafd,
  services: PROFILE_IMAGES.blueprint,
  asset_management: PROFILE_IMAGES.plant,
  engineering_design: PROFILE_IMAGES.cad,
  education_goals: PROFILE_IMAGES.campus,
  work_stages: PROFILE_IMAGES.facade,
  featured_projects: PROFILE_IMAGES.riyadhDay,
  statistics: PROFILE_IMAGES.riyadhNight,
  credentials: PROFILE_IMAGES.network,
  esg: PROFILE_IMAGES.clarifier,
  partners: PROFILE_IMAGES.partners,
  contact: PROFILE_IMAGES.team,
} as const;

export function getProfileImageAlt(image: ProfileImage, locale: AppLocale): string {
  return image.alt[locale];
}
