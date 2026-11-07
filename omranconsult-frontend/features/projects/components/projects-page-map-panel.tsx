"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { classNames } from "@/core/ui/class-names";
import { REGION_PINS } from "@/features/projects/region-pins";

type RegionItem = {
  readonly slug: string;
  readonly name?: string;
  readonly projectsCount?: number;
};

type ProjectsPageMapPanelProps = {
  readonly regions: readonly RegionItem[];
  readonly selectedRegion?: string;
};

export function ProjectsPageMapPanel({ regions, selectedRegion }: ProjectsPageMapPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("HomePage");
  const projectsT = useTranslations("ProjectsPage");

  const activeRegion = selectedRegion ?? regions[0]?.slug;
  const active = regions.find((region) => region.slug === activeRegion) ?? regions[0];

  const navigateRegion = (slug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (slug) {
      params.set("region", slug);
    } else {
      params.delete("region");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const toggleRegion = (slug: string) => {
    if (selectedRegion === slug) {
      navigateRegion(undefined);
      return;
    }
    navigateRegion(slug);
  };

  return (
    <div className="mapper-grid grid gap-10 lg:grid-cols-12 lg:items-center">
      <div className="relative rounded-(--oc-radius-brand) bg-page p-6 lg:col-span-7">
        <Image
          alt={projectsT("mapAlt")}
          className="h-auto w-full mix-blend-multiply"
          height={482}
          sizes="(max-width: 1024px) 100vw, 58vw"
          src="/images/profile/ksa-map.png"
          width={672}
        />
        {regions.map((region) => {
          const pin = REGION_PINS[region.slug];
          if (!pin) {
            return null;
          }
          const pressed = activeRegion === region.slug;
          return (
            <button
              aria-label={region.name ?? region.slug}
              aria-pressed={pressed}
              className="absolute h-11 w-11 -translate-x-1/2 -translate-y-4/5 border-0 bg-transparent"
              key={region.slug}
              onClick={() => toggleRegion(region.slug)}
              style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
              type="button"
            >
              <span
                className={classNames(
                  "absolute start-1/2 top-3/5 block size-7 -translate-1/2 rounded-full border-3 transition-transform",
                  pressed
                    ? "border-white bg-brand-green-light/35 scale-100 opacity-100"
                    : "border-brand-green-light scale-60 opacity-0 hover:opacity-100 hover:scale-100",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="text-white lg:col-span-5">
        <h3 className="font-display text-3xl font-extrabold text-white md:text-4xl">
          {active?.name ?? active?.slug}
        </h3>
        <div className="mt-4 flex flex-wrap gap-2" role="group">
          <button
            aria-pressed={!selectedRegion}
            className={classNames(
              "min-h-10 rounded-full px-3.5 text-sm font-medium transition-colors",
              !selectedRegion
                ? "bg-white font-bold text-brand-green-strong"
                : "border border-white/35 bg-brand-navy-deep/55 text-white hover:bg-brand-navy-deep/75",
            )}
            onClick={() => navigateRegion(undefined)}
            type="button"
          >
            {projectsT("allRegions")}
          </button>
          {regions.map((region) => (
            <button
              aria-pressed={selectedRegion === region.slug}
              className={classNames(
                "min-h-10 rounded-full px-3.5 text-sm font-medium transition-colors",
                selectedRegion === region.slug
                  ? "bg-white font-bold text-brand-green-strong"
                  : "border border-white/35 bg-brand-navy-deep/55 text-white hover:bg-brand-navy-deep/75",
              )}
              key={region.slug}
              onClick={() => toggleRegion(region.slug)}
              type="button"
            >
              {region.name ?? region.slug}
            </button>
          ))}
        </div>
        <p className="mt-6 text-base text-white">
          {active?.projectsCount != null
            ? t("regionProjectCount", { count: active.projectsCount })
            : projectsT("regionSoonNotice")}
        </p>
      </div>
    </div>
  );
}
