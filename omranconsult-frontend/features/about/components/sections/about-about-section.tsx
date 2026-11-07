import { getTranslations } from "next-intl/server";
import Image from "next/image";

import {
  asObject,
  asString,
  asStringList,
  firstBodyParagraph,
  headquartersCaption,
  secondBodyParagraph,
} from "@/features/home/lib/block-helpers";
import { SECTION_BACKGROUND_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type AboutAboutSectionProps = {
  readonly locale: AppLocale;
  readonly aboutBlock: unknown;
  readonly settingsAddress?: string;
};

export async function AboutAboutSection({ aboutBlock, locale, settingsAddress }: AboutAboutSectionProps) {
  const t = await getTranslations("HomePage");
  const block = asObject(aboutBlock);
  const heading = asString(block?.heading);
  const lead = firstBodyParagraph(aboutBlock);
  const note = secondBodyParagraph(aboutBlock);
  const moreParagraphs = asStringList(block?.body).slice(2);
  const image = SECTION_BACKGROUND_IMAGES.about;
  const hq = headquartersCaption(settingsAddress, locale);

  return (
    <section className="bg-page px-(--oc-page-margin) pb-(--oc-section-y) pt-8" data-section="about" id="about">
      <div className="grid grid-cols-12 gap-6">
        {heading ? (
          <h2 className="font-display col-span-12 text-(--text-oc-h2) leading-tight font-bold text-heading md:col-span-7">
            {heading}
          </h2>
        ) : null}
        {lead ? (
          <p className="col-span-12 mt-6 text-(--text-oc-lead) leading-relaxed text-muted md:col-span-7">{lead}</p>
        ) : null}
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-[minmax(0,8fr)_minmax(0,4fr)]">
        <div className="relative aspect-16/10 overflow-hidden rounded-(--oc-radius-brand) bg-brand-navy">
          <Image
            alt={getProfileImageAlt(image, locale)}
            className="h-full w-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            src={image.src}
          />
          {note ? (
            <p className="absolute end-0 top-0 max-w-[min(360px,60%)] rounded-es-(--oc-radius-brand) bg-page p-6 text-base leading-relaxed text-foreground">
              {note}
            </p>
          ) : null}
        </div>

        <div>
          <div
            aria-label={t("mapTileLabel")}
            className="relative aspect-square overflow-hidden rounded-(--oc-radius-brand) bg-brand-navy"
            role="img"
          >
            <Image
              alt=""
              className="absolute start-[10%] top-1/2 w-[80%] -translate-y-1/2"
              height={482}
              src="/images/profile/ksa-map.png"
              width={672}
            />
            <span
              aria-hidden
              className="absolute size-4 rounded-full border-[5px] border-white/35 bg-white bg-clip-padding left-[calc(10%+44.48%)] top-[calc(50%+8.2%)]"
            />
            {hq ? <span className="absolute start-4.5 bottom-4 text-sm text-white">{hq}</span> : null}
          </div>
        </div>
      </div>

      {moreParagraphs.length > 0 ? (
        <div className="about-more mt-18 grid gap-12 md:grid-cols-2">
          {moreParagraphs.map((paragraph) => (
            <p className="text-base leading-[1.8] text-muted" key={paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
