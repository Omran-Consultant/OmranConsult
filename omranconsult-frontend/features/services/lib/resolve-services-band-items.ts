import type { ServicesBandItem } from "@/features/home/components/home-services-band";
import { PROFILE_IMAGES, SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";

type ServiceCategory = {
  readonly slug: string;
  readonly kind: string;
  readonly title?: string;
  readonly services: readonly { readonly slug: string; readonly title?: string }[];
};

const BAND_IMAGE_BY_SLUG: Record<string, (typeof PROFILE_IMAGES)[keyof typeof PROFILE_IMAGES]> = {
  "engineering-consulting": PROFILE_IMAGES.blueprint,
  "project-management-and-technical-support": PROFILE_IMAGES.plant,
  "business-consulting": PROFILE_IMAGES.facade,
  "engineering-and-design": PROFILE_IMAGES.cad,
  "asset-management-services": SECTION_BACKGROUND_IMAGES.asset_management,
};

const BAND_GROW = [5, 2, 3, 2];

export function resolveServicesBandItems(categories: readonly ServiceCategory[]): ServicesBandItem[] {
  const prioritized = [
    ...categories.filter((item) => item.kind === "axis"),
    ...categories.filter((item) => item.slug === "engineering-and-design" || item.kind === "engineering_design"),
    ...categories.filter((item) => item.kind === "asset_management"),
  ];

  const picked: ServiceCategory[] = [];
  for (const category of prioritized) {
    if (picked.length >= 4) {
      break;
    }
    if (picked.some((entry) => entry.slug === category.slug)) {
      continue;
    }
    picked.push(category);
  }

  return picked.map((category, index) => ({
    title: category.title,
    image: BAND_IMAGE_BY_SLUG[category.slug] ?? PROFILE_IMAGES.blueprint,
    grow: BAND_GROW[index] ?? 2,
  }));
}
