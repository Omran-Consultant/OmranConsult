import { getTranslations } from "next-intl/server";

import {
  WorkStagesRow,
  mapWorkStageImages,
} from "@/features/about/components/work-stages-row";
import { asObject, asString, asStringList } from "@/features/home/lib/block-helpers";

type AboutWorkStagesSectionProps = {
  readonly workStagesBlock: unknown;
  readonly multiPhaseBlock: unknown;
  readonly locale: import("@/i18n/routing").AppLocale;
};

export async function AboutWorkStagesSection({
  locale,
  multiPhaseBlock,
  workStagesBlock,
}: AboutWorkStagesSectionProps) {
  const t = await getTranslations("AboutPage");
  const workStages = asObject(workStagesBlock);
  const multiPhase = asObject(multiPhaseBlock);
  const heading =
    asString(multiPhase?.section_title) ??
    asString(workStages?.section_title) ??
    undefined;
  const introSteps = asStringList(multiPhase?.steps);
  const stagesRaw = workStages?.stages;
  const stages = Array.isArray(stagesRaw)
    ? stagesRaw.map((stage, index) => {
        const record = typeof stage === "object" && stage !== null ? (stage as Record<string, unknown>) : {};
        return {
          phaseLabel: t("workPhase", { n: index + 1 }),
          title: asString(record.title),
          tags: asStringList(record.items),
          image: mapWorkStageImages(index),
        };
      })
    : [];

  const outputs = asStringList(multiPhase?.outputs).map((output, index) => ({
    title: output,
    tags: [] as string[],
    image: mapWorkStageImages(stages.length + index),
  }));

  const cards = [
    ...stages.map((stage) => ({ ...stage, body: undefined })),
    ...outputs.map((output) => ({
      phaseLabel: undefined,
      title: output.title,
      body: undefined,
      tags: output.tags,
      image: output.image,
    })),
  ];

  const coverage = asObject(workStages?.coverage);

  if (!heading && introSteps.length === 0 && cards.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-page pt-(--oc-section-y)" data-section="work-stages" id="work-stages">
      <div className="flex items-end justify-between gap-6 px-(--oc-page-margin)">
        {heading ? <h2 className="font-display text-(--text-oc-h2) font-bold text-heading">{heading}</h2> : null}
      </div>

      {introSteps.length > 0 ? (
        <ul className="mx-(--oc-page-margin) mt-6 grid max-w-[1200px] gap-3 md:grid-cols-2 md:gap-x-12">
          {introSteps.map((step) => (
            <li className="relative ps-5.5 text-base leading-relaxed text-muted" key={step}>
              <span aria-hidden className="absolute start-0 top-[0.7em] size-2 rounded-full bg-brand-green-strong" />
              {step}
            </li>
          ))}
        </ul>
      ) : asString(coverage?.body) ? (
        <p className="mx-(--oc-page-margin) mt-6 max-w-4xl text-base leading-relaxed text-muted">
          {asString(coverage?.body)}
        </p>
      ) : null}

      {cards.length > 0 ? <WorkStagesRow cards={cards} locale={locale} /> : null}
    </section>
  );
}
