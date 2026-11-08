"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { filterChipClassName } from "@/core/ui/filter-chip";
import { ProjectCard } from "@/core/ui/project-card";
import type { HomeProject } from "@/features/home/services/home-view";

const LIMIT = 6;

type ProjectsShowcaseProps = {
  /** «الكل»: the featured projects in the design order (H3). */
  readonly featured: readonly HomeProject[];
  /** A sector chip shows that sector's first six projects. */
  readonly projects: readonly HomeProject[];
  readonly sectors: readonly { readonly slug: string; readonly name: string }[];
  readonly titleId: string;
  /** The section header, placed beside the chips. */
  readonly header: ReactNode;
};

function card(project: HomeProject, sizes: string, emphasis: "standard" | "tall" = "standard") {
  return (
    <ProjectCard
      category={project.category}
      client={project.client}
      emphasis={emphasis}
      href={`/projects/${project.slug}`}
      image={project.image}
      key={project.slug}
      sizes={sizes}
      title={project.title}
    />
  );
}

/**
 * Sector chips (aria-pressed, filtering without reload), the desktop bento (one large + two
 * stacked, then three) and the mobile carousel (scroll-snap, dots, arrow keys: in RTL the left
 * arrow means next).
 */
export function ProjectsShowcase({ featured, projects, sectors, titleId, header }: ProjectsShowcaseProps) {
  const t = useTranslations("Home");
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  const visible = (sector ? projects.filter((project) => project.sectorSlug === sector) : featured).slice(0, LIMIT);
  const [first, second, third, ...rest] = visible;

  const chip = (slug: string | undefined, label: string) => {
    const selected = sector === slug;
    return (
      <button
        aria-pressed={selected}
        className={filterChipClassName(selected)}
        key={slug ?? "all"}
        onClick={() => {
          setSector(slug);
          setActive(0);
          trackRef.current?.scrollTo({ left: 0 });
        }}
        type="button"
      >
        {label}
      </button>
    );
  };

  const scrollToSlide = (index: number) => {
    const target = trackRef.current?.children[index] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const onTrackKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const previous = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key !== next && event.key !== previous) {
      return;
    }
    event.preventDefault();
    const index = Math.min(visible.length - 1, Math.max(0, active + (event.key === next ? 1 : -1)));
    setActive(index);
    scrollToSlide(index);
  };

  const onTrackScroll = () => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let closest = 0;
    let distance = Number.POSITIVE_INFINITY;
    Array.from(track.children).forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      const d = Math.abs(rect.left + rect.width / 2 - center);
      if (d < distance) {
        distance = d;
        closest = index;
      }
    });
    setActive(closest);
  };

  return (
    <>
      <div className="container-page flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10" data-reveal="">
        {header}
        <div aria-label={t("sectorFilter")} className="flex flex-wrap gap-2 max-md:hidden lg:max-w-140 lg:justify-end" role="group">
          {chip(undefined, t("allSectors"))}
          {sectors.map((item) => chip(item.slug, item.name))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="container-page text-body-m text-secondary">{t("emptySector")}</p>
      ) : (
        <>
          {/* Laptop and desktop: bento. */}
          <div className="container-page hidden flex-col gap-6 lg:flex">
            <div className="grid grid-cols-[740fr_516fr] items-stretch gap-6">
              {first ? <div className="row-span-2 h-full">{card(first, "(min-width: 1440px) 740px, 58vw", "tall")}</div> : null}
              {second ? card(second, "(min-width: 1440px) 516px, 40vw") : null}
              {third ? card(third, "(min-width: 1440px) 516px, 40vw") : null}
            </div>
            {rest.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">{rest.map((project) => card(project, "(min-width: 1440px) 411px, 32vw"))}</div>
            ) : null}
          </div>

          {/* Tablet: two columns. */}
          <div className="container-page hidden grid-cols-2 gap-5 md:grid lg:hidden">
            {visible.map((project) => card(project, "50vw"))}
          </div>

          {/* Mobile: horizontal carousel with scroll-snap and dots. */}
          <div className="md:hidden">
            <ul
              aria-describedby={`${titleId}-hint`}
              aria-label={t("carousel")}
              aria-roledescription="carousel"
              className="flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto scroll-smooth px-5 pb-1 [scrollbar-width:none] focus-visible:outline-offset-[-3px]"
              onKeyDown={onTrackKeyDown}
              onScroll={onTrackScroll}
              ref={trackRef}
              tabIndex={0}
            >
              {visible.map((project, index) => (
                <li
                  aria-label={t("slideLabel", { index: index + 1, total: visible.length })}
                  aria-roledescription="slide"
                  className="w-75 shrink-0 snap-start"
                  key={project.slug}
                >
                  {card(project, "300px")}
                </li>
              ))}
            </ul>
            <p className="sr-only" id={`${titleId}-hint`}>
              {t("carouselHint")}
            </p>
            <div aria-hidden="true" className="container-page mt-6 flex justify-start gap-1.5">
              {visible.map((project, index) => (
                <span
                  className={classNames("h-1 rounded-full transition-[width,background-color] duration-300", index === active ? "w-6 bg-accent" : "w-2 bg-line-strong")}
                  key={project.slug}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
