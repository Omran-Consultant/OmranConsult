import Image from "next/image";
import type { ReactNode } from "react";

import { AccentText } from "@/core/ui/accent-text";
import { Breadcrumb, type BreadcrumbItem } from "@/core/ui/breadcrumb";
import { classNames } from "@/core/ui/class-names";
import { Container } from "@/core/ui/container";
import { CountUp } from "@/core/ui/count-up";
import type { ImageAsset } from "@/core/ui/image-asset";

export type HeroStat = {
  readonly value: string;
  readonly label?: string;
};

type PageHeroProps = {
  readonly image: ImageAsset;
  /** May contain one `{accent}` word and line breaks. */
  readonly title: string;
  readonly intro?: string;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly breadcrumbLabel: string;
  readonly stats?: readonly HeroStat[];
  readonly className?: string;
  readonly children?: ReactNode;
};

/**
 * Figma "Page Hero": photo, dark scrim, breadcrumb, Display/L title, intro, optional
 * mini-stats. Always dark (text sits on a photo). The site header overlays the top.
 */
export function PageHero({ image, title, intro, breadcrumbs, breadcrumbLabel, stats, className, children }: PageHeroProps) {
  return (
    <header
      className={classNames(
        "scheme-dark relative isolate flex min-h-140 items-end overflow-hidden bg-canvas pt-36 pb-16 text-primary lg:pb-30",
        className,
      )}
      data-section="page-hero"
    >
      <Image alt={image.alt} className="-z-20 object-cover" fill priority sizes="100vw" src={image.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-scrim" />
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-190 flex-col gap-5">
          <Breadcrumb items={breadcrumbs} label={breadcrumbLabel} />
          <h1 className="font-display text-display-l">
            <AccentText value={title} />
          </h1>
          {intro ? <p className="max-w-155 text-body-l text-secondary">{intro}</p> : null}
          {children}
        </div>
        {stats && stats.length > 0 ? (
          <dl className="flex gap-14">
            {stats.map((stat) => (
              <div className="flex flex-col-reverse gap-1" key={`${stat.value}-${stat.label}`}>
                {stat.label ? <dt className="text-caption text-muted">{stat.label}</dt> : null}
                <dd>
                  <CountUp className="font-display text-number-m" value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </Container>
    </header>
  );
}
