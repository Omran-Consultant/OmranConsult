import { getTranslations } from "next-intl/server";

import { PageHero } from "@/core/ui/page-hero";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";

/** Figma Projects "Page Hero" (560 desktop, 420 mobile; Riyadh photo under navy 75 → 100 %). */
export async function ProjectsHero({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("Layout");
  const { hero } = view.copy;

  return (
    <PageHero
      breadcrumbLabel={t("breadcrumbLabel")}
      breadcrumbs={[{ label: t("nav.home"), href: "/" }, { label: t("nav.projects") }]}
      heightClassName="min-h-105 lg:min-h-140"
      image={view.heroImage}
      intro={hero.intro}
      introShort={hero.intro_short}
      scrim="scrim-down-75"
      stats={view.heroStats}
      title={hero.title ?? t("nav.projects")}
    />
  );
}
