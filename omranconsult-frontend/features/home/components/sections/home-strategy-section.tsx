import {
  asObject,
  asString,
} from "@/features/home/lib/block-helpers";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import Image from "next/image";

type HomeStrategySectionProps = {
  readonly strategyBlock: unknown;
  readonly sectionHeading?: string;
};

const STRATEGY_KEYS = ["vision", "mission", "objectives"] as const;

export function HomeStrategySection({ sectionHeading, strategyBlock }: HomeStrategySectionProps) {
  const strategy = asObject(strategyBlock);
  const background = SECTION_BACKGROUND_IMAGES.strategy;

  return (
    <section className="relative mt-(--section-y) overflow-hidden bg-canvas text-white" data-section="strategy">
      <Image
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-35"
        fill
        sizes="100vw"
        src={background.src}
      />
      <div className="relative px-page py-section-y">
        {sectionHeading ? (
          <h2 className="font-display max-w-3xl text-h1 leading-tight font-bold text-accent">
            {sectionHeading}
          </h2>
        ) : null}

        <div className="mt-14 flex flex-col gap-12">
          {STRATEGY_KEYS.map((key) => {
            const block = asObject(strategy?.[key]);
            const title = asString(block?.title);
            const body = asString(block?.body);
            if (!title && !body) {
              return null;
            }
            return (
              <article className="grid gap-6 md:grid-cols-10 md:items-baseline" key={key}>
                {title ? (
                  <h3 className="font-display text-3xl font-extrabold md:col-span-3 md:text-4xl">{title}</h3>
                ) : null}
                {body ? (
                  <p className="text-body-l leading-relaxed text-secondary md:col-span-7 md:max-w-[58ch]">{body}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
