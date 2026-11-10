import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Container } from "@/core/ui/container";
import { EmptyState } from "@/core/ui/empty-state";
import { Icon } from "@/core/ui/icon";
import { ProjectCard } from "@/core/ui/project-card";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";
import { MAX_PAGE, pageWindow, projectsQuery } from "@/features/projects/services/projects-filters";
import type { ProjectCardModel } from "@/features/projects/services/projects-view";
import { Link } from "@/i18n/navigation";

const PAGE_PILL = "flex size-11 items-center justify-center rounded-full border text-label-s transition-colors duration-150";

function card(project: ProjectCardModel, className: string, sizes: string) {
  return (
    <li className="h-full min-w-0" key={project.slug}>
      <ProjectCard
        category={project.category}
        className={className}
        client={project.client}
        href={`/projects/${project.slug}`}
        image={project.image}
        region={project.region}
        sizes={sizes}
        title={project.title}
        year={project.year}
      />
    </li>
  );
}

/**
 * Figma "Grid": 3 × 411×480 cards (gap 24) and the round pagination on desktop; the 390 frame
 * lists 350×400 cards with «عرض المزيد», which loads the next page under the current ones.
 */
export async function ProjectsGrid({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("ProjectsPage");
  const { filters, currentPage, lastPage } = view;
  const href = (page: number) => `/projects${projectsQuery(filters, { page })}`;

  return (
    <section aria-labelledby="projects-list-title" className="py-10 lg:pt-16 lg:pb-20" data-section="grid">
      <Container>
        <h2 className="sr-only" id="projects-list-title">
          {t("projectsHeading")}
        </h2>
        <p aria-live="polite" className="sr-only">
          {t("resultsCount", { count: view.total })}
        </p>

        {view.total === 0 ? (
          <EmptyState
            action={
              <LinkButton href="/projects" variant="secondary">
                {t("clearFilters")}
              </LinkButton>
            }
            description={t("emptyDescription")}
            title={t("emptyTitle")}
          />
        ) : (
          <>
            <ul className="grid gap-6 max-md:hidden md:grid-cols-2 lg:grid-cols-3">
              {view.desktopCards.map((project) => card(project, "", "(min-width: 1024px) 411px, 50vw"))}
            </ul>
            <ul className="flex flex-col gap-4 md:hidden">
              {view.mobileCards.map((project) => card(project, "", "100vw"))}
            </ul>

            {lastPage > 1 ? (
              <nav aria-label={t("paginationLabel")} className="flex justify-center pt-12 max-md:hidden">
                <ul className="flex items-center gap-2">
                  <li>
                    <PageArrow direction="previous" disabled={currentPage === 1} href={href(currentPage - 1)} label={t("previousPage")} />
                  </li>
                  {pageWindow(currentPage, lastPage).map((page, index) => (
                    <li key={page === "gap" ? `gap-${index}` : page}>
                      {page === "gap" ? (
                        <span aria-hidden="true" className={classNames(PAGE_PILL, "border-line-strong text-secondary")}>
                          …
                        </span>
                      ) : (
                        <Link
                          aria-current={page === currentPage ? "page" : undefined}
                          aria-label={t("pageLabel", { page })}
                          className={classNames(
                            PAGE_PILL,
                            "num-isolate",
                            page === currentPage
                              ? "border-accent-strong bg-accent-strong text-white"
                              : "border-line-strong text-primary hover:border-accent",
                          )}
                          href={href(page)}
                        >
                          {page}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li>
                    <PageArrow direction="next" disabled={currentPage === lastPage} href={href(currentPage + 1)} label={t("nextPage")} />
                  </li>
                </ul>
              </nav>
            ) : null}

            {view.mobileCards.length < view.total && currentPage < MAX_PAGE ? (
              <LinkButton className="mt-4 w-full md:hidden" href={href(currentPage + 1)} scroll={false} variant="secondary">
                {t("loadMore")}
              </LinkButton>
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}

type PageArrowProps = {
  readonly direction: "previous" | "next";
  readonly disabled: boolean;
  readonly href: string;
  readonly label: string;
};

function PageArrow({ direction, disabled, href, label }: PageArrowProps) {
  const icon = <Icon className="rtl:-scale-x-100" name={direction === "previous" ? "chevron-left" : "chevron-right"} />;
  if (disabled) {
    return (
      <span aria-disabled="true" className={classNames(PAGE_PILL, "border-line text-muted opacity-40")}>
        <span className="sr-only">{label}</span>
        {icon}
      </span>
    );
  }
  return (
    <Link aria-label={label} className={classNames(PAGE_PILL, "border-line-strong text-primary hover:border-accent")} href={href}>
      {icon}
    </Link>
  );
}
