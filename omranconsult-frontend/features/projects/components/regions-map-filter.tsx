"use client";

import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { REGION_PINS } from "@/features/projects/region-pins";

type RegionItem = {
  readonly slug: string;
  readonly name?: string;
  readonly projectsCount?: number;
};

type RegionsMapFilterProps = {
  readonly regions: readonly RegionItem[];
  readonly selectedRegion?: string;
};

export function RegionsMapFilter({ regions, selectedRegion }: RegionsMapFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("ProjectsPage");

  const updateRegion = (slug?: string) => {
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

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="relative overflow-hidden rounded-xl border border-line bg-surface p-4">
        <Image
          alt={t("mapAlt")}
          className="h-auto w-full"
          height={482}
          sizes="(max-width: 1024px) 100vw, 66vw"
          src="/images/profile/ksa-map.png"
          width={672}
        />

        {regions.map((region) => {
          const pin = REGION_PINS[region.slug];
          if (!pin) {
            return null;
          }

          return (
            <button
              aria-label={region.name ?? region.slug}
              aria-pressed={selectedRegion === region.slug}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-accent-strong px-2 py-1 text-xs text-white shadow"
              key={region.slug}
              onClick={() => updateRegion(selectedRegion === region.slug ? undefined : region.slug)}
              style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
              type="button"
            >
              {region.name ?? region.slug}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        <button
          aria-pressed={!selectedRegion}
          className="w-full rounded-lg border border-line px-3 py-2 text-start hover:bg-surface"
          onClick={() => updateRegion(undefined)}
          type="button"
        >
          {t("allRegions")}
        </button>
        {regions.map((region) => (
          <button
            aria-pressed={selectedRegion === region.slug}
            className="w-full rounded-lg border border-line px-3 py-2 text-start hover:bg-surface"
            key={region.slug}
            onClick={() => updateRegion(region.slug)}
            type="button"
          >
            {region.name ?? region.slug}
          </button>
        ))}
      </div>
    </div>
  );
}
