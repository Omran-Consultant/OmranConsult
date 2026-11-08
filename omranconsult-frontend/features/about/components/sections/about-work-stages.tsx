import { getTranslations } from "next-intl/server";

import { Icon, type IconName } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import type { AboutView } from "@/features/about/services/get-about-page-data";

const STAGE_ICONS: readonly IconName[] = ["building", "check", "cog"];

/** ✚ Work stages and coverage (D5): three stage cards in the Service Card style, then coverage. */
export async function AboutWorkStages({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("AboutPage");
  const { stages, coverage } = view.blocks.work_stages;
  if (stages.length === 0 && !coverage) {
    return null;
  }

  return (
    <section aria-labelledby="about-stages-title" className="bg-surface py-section-y" data-section="work-stages" id="work-stages">
      <div className="container-page flex flex-col gap-section-gap">
        {coverage?.heading ? (
          <SectionHeader overline={view.copy.work_stages.overline} subtitle={coverage.body} title={coverage.heading} titleId="about-stages-title" />
        ) : null}
        <ol className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {stages.map((stage, index) => (
            <li
              className={`flex flex-col gap-5 rounded-lg border p-8 ${index === 0 ? "border-line-accent bg-accent-strong/12" : "glass border-line"}`}
              data-reveal=""
              key={`${stage.title}-${index}`}
              style={{ "--reveal-index": index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <span className="flex size-13.5 items-center justify-center rounded-[14px] border border-line-accent bg-accent-strong text-green-300">
                  <Icon className="size-6" name={STAGE_ICONS[index] ?? "layers"} weight="duotone" />
                </span>
                <span className="num-isolate mt-5 font-latin text-overline text-muted">{t("stage", { n: index + 1 })}</span>
              </div>
              {stage.title ? <h3 className="font-display text-h3 text-primary">{stage.title}</h3> : null}
              <ul className="flex flex-col gap-3">
                {stage.items.map((item) => (
                  <li className="flex items-center gap-3 border-t border-line pt-3 text-body-s text-secondary" key={item}>
                    <span aria-hidden="true" className="h-0.5 w-3 shrink-0 bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
