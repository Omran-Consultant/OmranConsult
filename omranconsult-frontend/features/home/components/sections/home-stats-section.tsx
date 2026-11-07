import {
  SECTION_BACKGROUND_IMAGES,
  getProfileImageAlt,
} from "@/features/media/profile-images";
import { formatStatisticValue } from "@/features/home/services/statistic-formatter";
import { StatCountUp } from "@/features/home/components/stat-count-up";
import type { AppLocale } from "@/i18n/routing";
import Image from "next/image";

type Statistic = {
  readonly key: string;
  readonly value: number;
  readonly unit?: string;
  readonly suffix?: string;
  readonly scale?: string;
  readonly label?: string;
};

type HomeStatsSectionProps = {
  readonly locale: AppLocale;
  readonly statistics: readonly Statistic[];
  readonly heading?: string;
};

export function HomeStatsSection({ heading, locale, statistics }: HomeStatsSectionProps) {
  const [featured, ...rest] = statistics;
  const statsImage = SECTION_BACKGROUND_IMAGES.statistics;
  const featuredFormatted = featured
    ? formatStatisticValue({
        value: featured.value,
        locale,
        scale: featured.scale,
        suffix: featured.suffix,
      })
    : undefined;

  return (
    <section data-section="stats">
      <div className="relative min-h-[max(88svh,35rem)] overflow-hidden bg-canvas text-white">
        <Image
          alt={getProfileImageAlt(statsImage, locale)}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="100vw"
          src={statsImage.src}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[42%] bg-[rgb(9_20_40/0.62)]" />
        {heading ? (
          <h2 className="absolute start-(--page-margin) top-7 z-1 text-2xl font-bold">{heading}</h2>
        ) : null}
        {featured ? (
          <div className="absolute inset-x-(--page-margin) bottom-5 z-1 flex items-end justify-between gap-6">
            <StatCountUp
              className="font-display text-[clamp(7.5rem,17vw,17.5rem)] leading-[0.8] font-bold tracking-tight text-white"
              displayValue={featuredFormatted ?? String(featured.value)}
              endValue={featured.value}
              suffix={featured.suffix}
            />
            {featured.label ? (
              <p className="max-w-[26ch] pb-4 text-body-l leading-snug">{featured.label}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {rest.length > 0 ? (
        <div className="grid grid-cols-2 gap-6 px-page pt-10 sm:grid-cols-3 lg:grid-cols-5">
          {rest.map((stat) => {
            const formatted = formatStatisticValue({
              value: stat.value,
              locale,
              scale: stat.scale,
              suffix: stat.suffix,
            });
            return (
              <div className="flex flex-col gap-1" key={stat.key}>
                <StatCountUp
                  className="text-[clamp(2.125rem,3.2vw,3rem)] font-bold text-accent"
                  displayValue={formatted}
                  endValue={stat.value}
                  suffix={stat.suffix}
                />
                {stat.label ? <span className="text-sm leading-snug text-secondary">{stat.label}</span> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
