"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";

import { filterChipClassName } from "@/core/ui/filter-chip";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { EXPERT_GROUPS, filterExperts, expertGroup, type ExpertGroup } from "@/features/about/services/expert-groups";
import { showModalFrom } from "@/core/ui/show-modal";

export type ExpertCardModel = {
  readonly slug: string;
  readonly name: string;
  readonly title?: string;
  readonly bio?: string;
  readonly years: number;
  readonly initial: string;
  readonly portrait?: ImageAsset;
};

const GROUP_LABEL = {
  design: "expertGroupDesign",
  quality: "expertGroupQuality",
  data: "expertGroupData",
} as const satisfies Record<ExpertGroup, string>;

/**
 * About experts. Owner refinements (2026-11-08): equal cards, a crisper border and lift on hover,
 * one circular portrait size on a dark canvas with a centered cover crop, and specialty chips. Mobile is a
 * snap carousel; from 768 px the same cards are a grid.
 */
export function ExpertsGrid({ experts }: { readonly experts: readonly ExpertCardModel[] }) {
  const t = useTranslations("AboutPage");
  const [group, setGroup] = useState<ExpertGroup | undefined>(undefined);
  const [selected, setSelected] = useState<ExpertCardModel | undefined>(undefined);
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  const visible = filterExperts(experts, group);
  const groups = EXPERT_GROUPS.filter((item) => experts.some((expert) => expertGroup(expert.slug) === item));

  const open = (expert: ExpertCardModel, trigger: HTMLElement) => {
    setSelected(expert);
    showModalFrom(dialogRef.current, trigger);
  };

  const selectGroup = (next: ExpertGroup | undefined) => {
    setGroup(next);
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  };

  const scrollToSlide = (index: number) => {
    const target = trackRef.current?.children[index] as HTMLElement | undefined;
    target?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const onTrackKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const previous = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key !== next && event.key !== previous) {
      return;
    }
    event.preventDefault();
    const index = Math.min(visible.length - 1, Math.max(0, active + (event.key === next ? 1 : -1)));
    setActive(index);
    scrollToSlide(index);
  };

  return (
    <>
      <div aria-label={t("expertFilter")} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group">
        <button aria-pressed={group === undefined} className={filterChipClassName(group === undefined, "min-h-11!")} onClick={() => selectGroup(undefined)} type="button">
          {t("expertGroupAll")}
        </button>
        {groups.map((item) => (
          <button aria-pressed={group === item} className={filterChipClassName(group === item, "min-h-11!")} key={item} onClick={() => selectGroup(item)} type="button">
            {t(GROUP_LABEL[item])}
          </button>
        ))}
      </div>

      {visible.length === 0 ? <p className="text-body-m text-primary">{t("expertsEmpty")}</p> : null}

      <ul
        aria-describedby="experts-carousel-hint"
        aria-label={t("expertsCarousel")}
        aria-roledescription="carousel"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] focus-visible:outline-offset-[-3px] md:hidden"
        onKeyDown={onTrackKeyDown}
        ref={trackRef}
        tabIndex={0}
      >
        {visible.map((expert, index) => (
          <li aria-label={t("expertsSlide", { index: index + 1, total: visible.length })} aria-roledescription="slide" className="w-[85%] shrink-0 snap-start" key={expert.slug}>
            <ExpertCard expert={expert} onOpen={open} yearsLabel={t("expertYears", { years: expert.years })} />
          </li>
        ))}
      </ul>
      <p className="sr-only md:hidden" id="experts-carousel-hint">
        {t("expertsCarouselHint")}
      </p>

      <ul className="hidden gap-4 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {visible.map((expert, index) => (
          <li data-reveal="" key={expert.slug} style={{ "--reveal-index": index % 3 } as React.CSSProperties}>
            <ExpertCard expert={expert} onOpen={open} yearsLabel={t("expertYears", { years: expert.years })} />
          </li>
        ))}
      </ul>

      <dialog
        aria-labelledby="expert-dialog-title"
        className="m-auto w-[min(40rem,calc(100%-2.5rem))] rounded-lg border border-line bg-elevated p-0 text-primary shadow-elevated backdrop:bg-navy-950/70"
        onClose={() => setSelected(undefined)}
        ref={dialogRef}
      >
        {selected ? (
          <div className="flex flex-col gap-5 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-h3" id="expert-dialog-title">
                  {selected.name}
                </h3>
                {selected.title ? <p className="text-body-s text-primary">{selected.title}</p> : null}
              </div>
              <button
                aria-label={t("closeBio")}
                autoFocus
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-150 hover:border-accent"
                onClick={() => dialogRef.current?.close()}
                type="button"
              >
                <Icon name="close" />
              </button>
            </div>
            <p className="text-body-m text-secondary">{selected.bio}</p>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function ExpertCard({
  expert,
  yearsLabel,
  onOpen,
}: {
  readonly expert: ExpertCardModel;
  readonly yearsLabel: string;
  readonly onOpen: (expert: ExpertCardModel, trigger: HTMLElement) => void;
}) {
  return (
    <button
      aria-haspopup="dialog"
      className="group flex h-full w-full items-center gap-4 rounded-lg border border-line-strong bg-surface p-4 text-start transition-[transform,border-color,background-color,box-shadow] duration-150 hover:border-line-accent hover:bg-elevated hover:shadow-lift motion-safe:md:hover:-translate-y-1 md:gap-5 md:p-5"
      disabled={!expert.bio}
      onClick={(event) => onOpen(expert, event.currentTarget)}
      type="button"
    >
      <span className="scheme-dark relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line-accent bg-canvas">
        {expert.portrait ? (
          <Image
            alt=""
            className="size-full object-cover object-center motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
            fill
            sizes="96px"
            src={expert.portrait.src}
          />
        ) : (
          <span aria-hidden="true" className="flex size-full items-center justify-center font-display text-h3 text-primary">
            {expert.initial}
          </span>
        )}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_72%,var(--bg-base)_100%)]" />
      </span>
      <span className="flex min-h-24 min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-display text-label-m text-primary md:text-h4">{expert.name}</span>
        {expert.title ? <span className="line-clamp-2 min-h-[2lh] text-body-s text-primary">{expert.title}</span> : null}
        <span className="mt-auto self-start rounded-full bg-accent-strong/16 px-2.5 py-0.5 text-caption text-accent">{yearsLabel}</span>
      </span>
    </button>
  );
}
