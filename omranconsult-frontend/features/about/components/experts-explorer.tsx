"use client";

import { useState } from "react";

import { Card } from "@/core/ui/card";
import { classNames } from "@/core/ui/class-names";
import { EXPERT_PORTRAITS, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";
import Image from "next/image";

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
  readonly locale: AppLocale;
};

export function ExpertsExplorer({ experts, locale }: ExpertsExplorerProps) {
  const [selectedSlug, setSelectedSlug] = useState(experts[0]?.slug);
  const selectedExpert = experts.find((expert) => expert.slug === selectedSlug) ?? experts[0];
  const portrait = selectedExpert ? EXPERT_PORTRAITS[selectedExpert.slug as keyof typeof EXPERT_PORTRAITS] : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-3">
        {experts.map((expert) => (
          <button
            aria-expanded={expert.slug === selectedExpert?.slug}
            className={classNames(
              "w-full rounded-lg border border-border bg-surface p-4 text-start transition-colors",
              expert.slug === selectedExpert?.slug
                ? "border-brand-green-strong bg-brand-green-light/10"
                : "hover:bg-surface-muted",
            )}
            key={expert.id}
            onClick={() => setSelectedSlug(expert.slug)}
            type="button"
          >
            <p className="font-display text-lg font-semibold text-heading">{expert.name}</p>
            <p className="text-sm text-muted">{expert.title}</p>
          </button>
        ))}
      </div>

      {selectedExpert ? (
        <Card>
          {portrait ? (
            <Image
              alt={getProfileImageAlt(portrait, locale)}
              className="h-auto w-full rounded-md"
              height={portrait.height}
              sizes="(max-width: 1024px) 100vw, 22rem"
              src={portrait.src}
              width={portrait.width}
            />
          ) : null}
          <h3 className="mt-4 font-display text-xl font-semibold text-heading">{selectedExpert.name}</h3>
          <p className="mt-1 text-sm text-muted">{selectedExpert.title}</p>
          <p className="mt-3 text-sm text-muted">{selectedExpert.bio}</p>
        </Card>
      ) : null}
    </div>
  );
}
