import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Breadcrumb } from "@/core/ui/breadcrumb";
import { Container } from "@/core/ui/container";
import type { ProjectDetailView } from "@/features/projects/services/get-project-detail-data";

/**
 * Figma Project Details "Hero" (820 desktop, 520 mobile): project photo, navy 55 → 35 → 100 %,
 * breadcrumb, sector badge and the Display/L title (900 wide). From 1024 px the height is capped
 * by the viewport so the title stays above the fold on a short laptop; taller screens keep 820.
 * WCAG deviation: the badge is a green tint with green/300 text; the design's green/300 on solid
 * green/600 is 1.9:1.
 */
export async function ProjectDetailHero({ project, title }: { readonly project: ProjectDetailView; readonly title: string }) {
  const t = await getTranslations("Layout");
  const badge = [project.sector?.name, project.serviceType].filter(Boolean).join(" · ");

  return (
    <header
      className="scheme-dark relative isolate flex min-h-130 items-end overflow-hidden bg-canvas pt-36 pb-10 text-primary lg:min-h-[min(820px,100svh)] lg:pb-20"
      data-section="hero"
    >
      <Image alt={project.heroImage.alt} className="-z-20 object-cover" fill priority quality={60} sizes="100vw" src={project.heroImage.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 scrim-detail" />
      <Container>
        <div className="flex max-w-225 flex-col items-start gap-3 lg:gap-5">
          <Breadcrumb
            items={[{ label: t("nav.home"), href: "/" }, { label: t("nav.projects"), href: "/projects" }, { label: title }]}
            label={t("breadcrumbLabel")}
          />
          {badge ? (
            <span className="rounded-full border border-accent/40 bg-accent-strong/18 px-3.5 py-1.5 text-caption text-accent backdrop-blur-md max-md:hidden">
              {badge}
            </span>
          ) : null}
          <h1 className="font-display text-h1 md:text-display-l">{title}</h1>
        </div>
      </Container>
    </header>
  );
}
