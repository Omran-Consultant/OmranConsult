import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

import { LinkButton } from "@/core/ui/button";
import { HomeProjectsMapPanel } from "@/features/home/components/home-projects-map-panel";
import {
  featuredProjectImage,
  groupFeaturedProjects,
  PROJECT_LAYOUT_CLASS,
} from "@/features/home/lib/featured-projects";
import { getProfileImageAlt } from "@/features/media/profile-images";
import type { HomePageData } from "@/features/home/types/home-page-data";
import type { AppLocale } from "@/i18n/routing";

type HomeProjectsSectionProps = {
  readonly locale: AppLocale;
  readonly heading?: string;
  readonly projects: HomePageData["projects"]["projects"];
  readonly regions: HomePageData["regions"];
  readonly clients: HomePageData["clients"];
};

export async function HomeProjectsSection({
  clients,
  heading,
  locale,
  projects,
  regions,
}: HomeProjectsSectionProps) {
  const t = await getTranslations("HomePage");
  const clientOrder = new Map(
    clients.filter((client) => client.slug).map((client) => [client.slug as string, client.sortOrder]),
  );
  const groups = groupFeaturedProjects(projects, clientOrder, 3);

  return (
    <section
      className="mt-24 bg-brand-green-strong px-(--oc-page-margin) py-24 pb-(--oc-section-y) text-white"
      data-section="projects"
      id="projects"
    >
      {heading ? (
        <h2 className="font-display text-(--text-oc-h2) leading-tight font-bold">{heading}</h2>
      ) : null}

      <HomeProjectsMapPanel regions={regions} />

      <div className="mt-(--oc-section-y) flex flex-col gap-20">
        {groups.map((group, index) => {
          const layout = PROJECT_LAYOUT_CLASS[index % PROJECT_LAYOUT_CLASS.length];
          const image = featuredProjectImage(index);
          return (
            <article className={`home-proj ${layout} grid grid-cols-12 items-center gap-6`} key={group.clientSlug ?? index}>
              <figure className="relative m-0 overflow-hidden">
                <Image
                  alt={getProfileImageAlt(image, locale)}
                  className="h-full w-full object-cover"
                  height={image.height}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={image.src}
                  width={image.width}
                />
              </figure>
              <div className="home-proj-text">
                {group.clientName ? (
                  <p className="mb-2 text-sm font-bold text-white">{group.clientName}</p>
                ) : null}
                <ul className="mt-2 space-y-1">
                  {group.projects.map((project) => (
                    <li key={project.slug}>
                      <Link className="text-lg leading-relaxed text-white underline-offset-4 hover:underline" href={`/projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-12">
        <LinkButton
          className="rounded-full border border-white/30 bg-white text-brand-navy hover:bg-brand-green-light hover:text-brand-navy-deep"
          href="/projects"
          variant="solid"
        >
          {t("projectsCta")}
        </LinkButton>
      </div>
    </section>
  );
}
