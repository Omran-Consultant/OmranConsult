import { SectionHeader } from "@/core/ui/section-header";
import { StatItem } from "@/core/ui/stat-item";
import type { HomeView } from "@/features/home/services/home-view";

/** Figma Home "Stats": header and side text, five Stat Items (the first accent-coloured). */
export function HomeStats({ view }: { readonly view: HomeView }) {
  const { stats: copy } = view.copy;

  return (
    <section aria-label={copy.title} className="bg-canvas py-10 lg:py-30" data-section="stats">
      <div className="container-page flex flex-col gap-16">
        {copy.title ? (
          <div className="hidden items-end justify-between gap-10 md:flex" data-reveal="">
            <SectionHeader overline={copy.overline} title={copy.title} />
            {copy.side_text ? <p className="max-w-105 text-body-m text-secondary">{copy.side_text}</p> : null}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-x-4 lg:grid-cols-5 lg:gap-8">
          {view.stats.map((stat, index) => (
            <StatItem
              accent={index === 0}
              className="max-lg:gap-1.5 max-lg:pt-5 max-lg:pb-5"
              key={stat.key}
              label={stat.label}
              shortLabel={copy.short_labels[stat.key]}
              value={stat.value}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
