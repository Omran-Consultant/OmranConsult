"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LinkButton } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { EXPERT_PORTRAITS, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type Expert = {
  readonly id: number;
  readonly slug: string;
  readonly name?: string;
  readonly title?: string;
  readonly yearsExperience: number;
};

type HomeExpertsPreviewProps = {
  readonly experts: readonly Expert[];
  readonly heading?: string;
  readonly locale: AppLocale;
};

export function HomeExpertsPreview({ experts, heading, locale }: HomeExpertsPreviewProps) {
  const t = useTranslations("HomePage");
  const [selectedSlug, setSelectedSlug] = useState(experts[0]?.slug);
  const selectedExpert = experts.find((expert) => expert.slug === selectedSlug) ?? experts[0];
  const portrait = selectedExpert
    ? EXPERT_PORTRAITS[selectedExpert.slug as keyof typeof EXPERT_PORTRAITS]
    : undefined;

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
                sizes="(max-width: 1024px) 100vw, 440px"
                src={image.src}
              />
            );
          })}
          {!portrait ? (
            <div className="flex h-full items-center justify-center text-muted">—</div>
          ) : null}
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
                  aria-pressed={active}
                  className={classNames(
                    "flex w-full min-h-18 items-center justify-between gap-4 py-3 text-start transition-colors",
                    active ? "text-heading" : "text-muted hover:text-heading",
                  )}
                  onClick={() => setSelectedSlug(expert.slug)}
                  type="button"
                >
                  <span className="font-display text-xl font-bold">{expert.name}</span>
                  <span className={classNames("text-sm whitespace-nowrap", active ? "font-bold text-brand-green-strong" : "")}>
                    {t("expertYears", { years: expert.yearsExperience })}
                  </span>
                </button>
                {active && expert.title ? (
                  <p className="pb-5 text-base font-bold text-brand-green-strong">{expert.title}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
        <div className="mt-8">
          <LinkButton href="/about#experts" variant="outline">
            {t("expertsCta")}
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
