"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";

export type ExpertCardModel = {
  readonly slug: string;
  readonly name: string;
  readonly title?: string;
  readonly bio?: string;
  readonly years: number;
  readonly initial: string;
  readonly portrait?: ImageAsset;
};

const MOBILE_LIMIT = 3;

/**
 * Figma About "Experts": 3×2 cards (portrait, name, title, years badge). A card opens the bio in a
 * modal dialog (Esc closes, focus returns). Mobile shows three cards and «عرض الكل».
 */
export function ExpertsGrid({ experts }: { readonly experts: readonly ExpertCardModel[] }) {
  const t = useTranslations("AboutPage");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<ExpertCardModel | undefined>(undefined);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = (expert: ExpertCardModel) => {
    setSelected(expert);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-14">
        {experts.map((expert, index) => (
          <li className={classNames(!showAll && index >= MOBILE_LIMIT && "max-md:hidden")} data-reveal="" key={expert.slug} style={{ "--reveal-index": index % 3 } as React.CSSProperties}>
            <button
              aria-haspopup="dialog"
              aria-label={expert.bio ? t("readBio", { name: expert.name }) : undefined}
              className="flex w-full items-center gap-3.5 rounded-[18px] border border-line bg-surface p-4 text-start transition-colors duration-150 hover:border-line-accent md:gap-5 md:rounded-lg md:bg-canvas md:p-6"
              disabled={!expert.bio}
              onClick={() => open(expert)}
              type="button"
            >
              <span className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.5px] border-line-accent bg-highlight font-display text-h2 text-primary md:size-21">
                {expert.portrait ? (
                  <Image alt="" className="object-cover object-top" fill sizes="84px" src={expert.portrait.src} />
                ) : (
                  <span aria-hidden="true">{expert.initial}</span>
                )}
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="font-display text-label-m text-primary md:text-h4">{expert.name}</span>
                {expert.title ? <span className="text-body-s text-secondary">{expert.title}</span> : null}
                <span className="self-start rounded-full bg-accent-strong/16 max-md:hidden px-2.5 py-0.5 text-caption text-accent">{t("expertYears", { years: expert.years })}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {experts.length > MOBILE_LIMIT ? (
        <button
          aria-expanded={showAll}
          className="inline-flex items-center gap-3 self-start py-1.5 text-label-m text-accent md:hidden"
          onClick={() => setShowAll((value) => !value)}
          type="button"
        >
          <span>{showAll ? t("showFewerExperts") : t("viewAllExperts")}</span>
          <Icon name="arrow" />
        </button>
      ) : null}

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
                {selected.title ? <p className="text-body-s text-secondary">{selected.title}</p> : null}
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
