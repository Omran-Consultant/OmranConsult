"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { classNames } from "@/core/ui/class-names";
import { EXPERT_PORTRAITS, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type Expert = {
  readonly id: number;
  readonly slug: string;
  readonly name?: string;
  readonly title?: string;
  readonly bio?: string;
  readonly yearsExperience: number;
};

type ExpertsExplorerProps = {
  readonly experts: readonly Expert[];
  readonly heading?: string;
  readonly locale: AppLocale;
};

export function ExpertsExplorer({ experts, heading, locale }: ExpertsExplorerProps) {
  const t = useTranslations("HomePage");
  const [selectedSlug, setSelectedSlug] = useState(experts[0]?.slug);
  const selectedExpert = experts.find((expert) => expert.slug === selectedSlug) ?? experts[0];

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-5 lg:sticky lg:top-[14vh] lg:self-start">
        <div className="relative mx-auto aspect-4/5 max-w-[27.5rem] overflow-hidden rounded-t-[240px] rounded-b-[var(--oc-radius-brand)] bg-surface">
          {experts.map((expert) => {
            const image = EXPERT_PORTRAITS[expert.slug as keyof typeof EXPERT_PORTRAITS];
            if (!image) {
              return null;
            }
            return (
              <Image
                alt={getProfileImageAlt(image, locale)}
                className={classNames(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
                  expert.slug === selectedExpert?.slug ? "opacity-100" : "opacity-0",
                )}
                fill
                key={expert.slug}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 440px"
                src={image.src}
              />
            );
          })}
        </div>
      </div>

      <div className="lg:col-span-6 lg:col-start-7">
        {heading ? (
          <h2 className="font-display mb-10 text-(--text-oc-h2) leading-tight font-bold text-heading">{heading}</h2>
        ) : null}
        <ul className="divide-y-2 divide-border-strong">
          {experts.map((expert) => {
            const active = expert.slug === selectedExpert?.slug;
            return (
              <li key={expert.id}>
                <button
                  aria-expanded={active}
                  className={classNames(
                    "flex w-full min-h-18 items-center justify-between gap-4 py-3 text-start transition-colors",
                    active ? "text-heading" : "text-muted hover:text-heading",
                  )}
                  onClick={() => setSelectedSlug(expert.slug)}
                  type="button"
                >
                  <span className="font-display text-xl font-bold">{expert.name}</span>
                  <span
                    className={classNames(
                      "text-sm whitespace-nowrap",
                      active ? "font-bold text-brand-green-strong" : "",
                    )}
                  >
                    {t("expertYears", { years: expert.yearsExperience })}
                  </span>
                </button>
                {active ? (
                  <div className="pb-5">
                    {expert.title ? (
                      <p className="text-base font-bold text-brand-green-strong">{expert.title}</p>
                    ) : null}
                    {expert.bio ? <p className="mt-3 text-base leading-relaxed text-muted">{expert.bio}</p> : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
