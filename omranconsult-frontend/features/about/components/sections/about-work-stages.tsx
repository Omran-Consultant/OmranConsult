import Image from "next/image";
import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "@/core/ui/section-header";
import { LifecycleRing } from "@/features/about/components/lifecycle-ring";
import type { AboutView } from "@/features/about/services/get-about-page-data";
import { SITE_IMAGES } from "@/features/media/profile-images";

/**
 * ✚ Work stages and coverage (D5), owner-approved concept C1 (SITE_TWEAKS_2 C3): a dark earth band in
 * both themes, glass stage cards beside the lifecycle ring, then the green coverage card.
 */
export async function AboutWorkStages({ view }: { readonly view: AboutView }) {
  const t = await getTranslations("AboutPage");
  const { stages, coverage } = view.blocks.work_stages;
  if (stages.length === 0 && !coverage) {
    return null;
  }
  const stat = view.coverageStat;

  return (
    <section
      aria-labelledby="about-stages-title"
      className="scheme-dark relative isolate overflow-hidden bg-navy-950 py-section-y text-white"
      data-section="work-stages"
      id="work-stages"
    >
      <Image alt="" className="-z-20 object-cover" fill sizes="100vw" src={SITE_IMAGES.earth.src} />
      <div aria-hidden="true" className="scrim-band absolute inset-0 -z-10" />
      <div className="container-page flex flex-col gap-10">
        <SectionHeader overline={view.copy.work_stages.overline} title={t("workStagesTitle")} titleId="about-stages-title" />

        {stages.length > 0 ? (
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_20rem] lg:gap-10 xl:grid-cols-[1fr_25rem]">
            <ol className="flex flex-col gap-4">
              {stages.map((stage, index) => (
                <li
                  className="flex flex-col gap-3.5 rounded-[22px] border border-green-300/28 bg-green-500/14 px-6.5 py-5.5 backdrop-blur-[10px]"
                  data-reveal=""
                  key={`${stage.title}-${index}`}
                  style={{ "--reveal-index": index } as CSSProperties}
                >
                  <div className="flex items-center gap-3.5">
                    {stage.title ? <h3 className="flex-1 font-display text-h3 text-white">{stage.title}</h3> : <span className="flex-1" />}
                    <span className="num-isolate font-latin text-[2.375rem] leading-none font-medium text-green-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {stage.items.map((item) => (
                      <li className="inline-flex min-h-8.5 items-center rounded-full bg-white/8 px-3.5 py-1 text-body-s text-white" key={item}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            <LifecycleRing
              className="mx-auto size-60 max-lg:order-first md:size-80 xl:size-95"
              line1={t("lifecycleLine1")}
              line2={t("lifecycleLine2")}
            />
          </div>
        ) : null}

        {coverage?.heading || coverage?.body ? (
          <div
            className={`coverage-green grid items-center gap-8 rounded-[26px] p-6 md:px-12 md:py-10 lg:gap-10 ${stat ? "lg:grid-cols-[1fr_18.75rem]" : ""}`}
            data-coverage-card=""
            data-reveal=""
          >
            <div>
              {coverage.heading ? (
                <h3 className="mb-3.5 inline-block border-b-2 border-white pb-1.5 font-display text-h2 text-white">{coverage.heading}</h3>
              ) : null}
              {coverage.body ? <p className="text-body-m leading-[calc(1.9/var(--type-scale))] text-white">{coverage.body}</p> : null}
            </div>
            {stat ? (
              <p className="flex flex-col items-center gap-1.5 text-center text-white" data-coverage-stat="">
                <span className="font-latin text-[3.5rem] leading-none font-semibold md:text-[4.75rem]" dir="ltr">{stat.value}</span>
                {stat.label ? <span className="text-body-l">{stat.label}</span> : null}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
