"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";
import { PROFILE_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type WorkStageCard = {
  readonly phaseLabel?: string;
  readonly title?: string;
  readonly body?: string;
  readonly tags: readonly string[];
  readonly image: (typeof PROFILE_IMAGES)[keyof typeof PROFILE_IMAGES];
};

type WorkStagesRowProps = {
  readonly locale: AppLocale;
  readonly cards: readonly WorkStageCard[];
};

const STAGE_IMAGES = [
  PROFILE_IMAGES.facade,
  PROFILE_IMAGES.plant,
  PROFILE_IMAGES.team,
  PROFILE_IMAGES.kafd,
  PROFILE_IMAGES.engineerSkyline,
  PROFILE_IMAGES.blueprint,
  PROFILE_IMAGES.cad,
  PROFILE_IMAGES.riyadhDay,
] as const;

export function mapWorkStageImages(index: number) {
  return STAGE_IMAGES[index % STAGE_IMAGES.length];
}

export function WorkStagesRow({ cards, locale }: WorkStagesRowProps) {
  const t = useTranslations("AboutPage");
  const rowRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const rtl = locale === "ar";

  const updateProgress = useCallback(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }
    const max = row.scrollWidth - row.clientWidth;
    if (max <= 0) {
      setProgress(100);
      return;
    }
    setProgress((row.scrollLeft / max) * 100);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }
    updateProgress();
    row.addEventListener("scroll", updateProgress, { passive: true });
    return () => row.removeEventListener("scroll", updateProgress);
  }, [updateProgress, cards.length]);

  const scrollByPage = useCallback(
    (direction: -1 | 1) => {
      const row = rowRef.current;
      if (!row) {
        return;
      }
      const delta = direction * Math.max(row.clientWidth * 0.85, 280);
      row.scrollBy({ left: rtl ? -delta : delta, behavior: "smooth" });
    },
    [rtl],
  );

  const cardNodes = useMemo(
    () =>
      cards.map((card, index) => (
        <article className="flex w-[300px] shrink-0 snap-start flex-col" key={`${card.title ?? "stage"}-${index}`}>
          {card.phaseLabel ? (
            <span className="text-sm font-bold text-brand-green-strong">{card.phaseLabel}</span>
          ) : null}
          {card.title ? <h3 className="mt-1 font-display text-xl font-extrabold text-heading">{card.title}</h3> : null}
          {card.body ? <p className="mt-2 text-base leading-relaxed text-muted">{card.body}</p> : null}
          {card.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.tags.map((tag) => (
                <span className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-foreground" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-auto flex flex-col justify-end pt-6">
            <Image
              alt={getProfileImageAlt(card.image, locale)}
              className="aspect-4/5 w-full rounded-(--oc-radius-brand) object-cover"
              height={card.image.height}
              sizes="300px"
              src={card.image.src}
              width={card.image.width}
            />
          </div>
        </article>
      )),
    [cards, locale],
  );

  return (
    <>
      <div
        aria-hidden
        className="mx-(--oc-page-margin) mt-9 h-1.5 overflow-hidden rounded-sm bg-border"
      >
        <span className="block h-full bg-brand-navy transition-[width] duration-200" style={{ width: `${progress}%` }} />
      </div>
      <div
        aria-label={t("workStagesScrollLabel")}
        className="mx-(--oc-page-margin) mt-8 flex snap-x snap-mandatory gap-8 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={rowRef}
        tabIndex={0}
      >
        {cardNodes}
      </div>
      <div className="mx-(--oc-page-margin) mt-6 flex justify-end gap-2">
        <button
          aria-label={t("scrollPrevious")}
          className={classNames(
            "grid size-13 place-items-center rounded-full bg-brand-navy text-white transition-colors hover:bg-brand-green-strong",
          )}
          onClick={() => scrollByPage(-1)}
          type="button"
        >
          <span aria-hidden className={classNames("inline-block", rtl ? "" : "scale-x-[-1]")}>
            →
          </span>
        </button>
        <button
          aria-label={t("scrollNext")}
          className="grid size-13 place-items-center rounded-full bg-brand-navy text-white transition-colors hover:bg-brand-green-strong"
          onClick={() => scrollByPage(1)}
          type="button"
        >
          <span aria-hidden className={classNames("inline-block", rtl ? "scale-x-[-1]" : "")}>
            →
          </span>
        </button>
      </div>
    </>
  );
}
