import { getTranslations } from "next-intl/server";

import { Button } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Container } from "@/core/ui/container";
import { filterChipClassName } from "@/core/ui/filter-chip";
import { Icon } from "@/core/ui/icon";
import { ListboxSelect } from "@/core/ui/listbox-select";
import { ProjectsSearch } from "@/features/projects/components/projects-search";
import type { ProjectsView } from "@/features/projects/services/get-projects-page-data";
import { projectsQuery } from "@/features/projects/services/projects-filters";
import { Link } from "@/i18n/navigation";

/**
 * Figma "Filter Bar": every sector as a chip (H4) plus the search pill. The owning entity and
 * region filters (A20) sit in a «فلاتر إضافية» disclosure. The design's sort control is not built:
 * the API has no sort parameter.
 */
export async function ProjectsFilterBar({ view }: { readonly view: ProjectsView }) {
  const t = await getTranslations("ProjectsPage");
  const { filters } = view;
  const extraCount = Number(Boolean(filters.client)) + Number(Boolean(filters.region));

  const chip = (slug: string | undefined, label: string) => {
    const selected = filters.sector === slug;
    return (
      <li key={slug ?? "all"}>
        <Link
          aria-current={selected ? "true" : undefined}
          className={filterChipClassName(selected)}
          href={`/projects${projectsQuery(filters, { sector: slug, page: 1 })}`}
          scroll={false}
        >
          {label}
        </Link>
      </li>
    );
  };

  return (
    <section aria-label={t("filtersLabel")} className="md:border-b md:border-line md:bg-surface" data-section="filter-bar">
      <Container className="flex flex-col gap-4 py-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8 lg:py-7">
        {/*
          F0c — wrap to a second line on desktop. Closer to Figma (every sector chip visible;
          handoff has no edge fade or prev/next). Mobile keeps one scrolling row.
        */}
        <ul className="-mx-5 flex min-w-0 gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {chip(undefined, t("allSectors"))}
          {view.sectors.map((sector) => chip(sector.slug, sector.name))}
        </ul>

        <div className="flex items-center gap-3">
          <ProjectsSearch className="flex-1 lg:w-70 lg:flex-none" filters={filters} label={t("searchLabel")} placeholder={t("searchPlaceholder")} />
          <details className="group relative">
            <summary
              className={classNames(
                "relative flex size-11 cursor-pointer list-none items-center justify-center rounded-full border transition-colors duration-150 md:size-12 [&::-webkit-details-marker]:hidden",
                extraCount > 0 ? "border-accent text-primary" : "border-line-strong text-secondary hover:border-accent hover:text-primary",
              )}
              title={t("moreFilters")}
            >
              <Icon name="filter" />
              <span className="sr-only">{t("moreFilters")}</span>
              {extraCount > 0 ? (
                <span className="num-isolate absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent-strong text-caption text-white">
                  {extraCount}
                </span>
              ) : null}
            </summary>
            <form
              action=""
              className="absolute end-0 top-full z-20 mt-2 flex w-80 max-w-[calc(100vw-2.5rem)] flex-col gap-4 rounded-lg border border-line bg-elevated p-5 shadow-elevated"
            >
              {filters.sector ? <input name="sector" type="hidden" value={filters.sector} /> : null}
              {filters.q ? <input name="q" type="hidden" value={filters.q} /> : null}
              <ListboxSelect
                defaultValue={filters.client ?? ""}
                id="projects-client"
                label={t("clientFilterLabel")}
                name="client"
                options={[{ value: "", label: t("allClients") }, ...view.owners.map((owner) => ({ value: owner.slug, label: owner.name }))]}
              />
              <ListboxSelect
                defaultValue={filters.region ?? ""}
                id="projects-region"
                label={t("regionFilterLabel")}
                name="region"
                options={[{ value: "", label: t("allRegions") }, ...view.regions.map((region) => ({ value: region.slug, label: region.name }))]}
              />
              <Button className="w-full" type="submit">
                {t("applyFilters")}
              </Button>
            </form>
          </details>
        </div>
      </Container>
    </section>
  );
}
