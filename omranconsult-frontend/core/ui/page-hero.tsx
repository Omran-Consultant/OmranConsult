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
  /** Shorter intro below 768 px (the 390 frames). */
  readonly introShort?: string;
  readonly breadcrumbs: readonly BreadcrumbItem[];
  readonly breadcrumbLabel: string;
  /** Hidden below 768 px (the 390 frames show none). */
  readonly stats?: readonly HeroStat[];
  /** Scrim utility from the Figma frame, for example `scrim-down-70` or `scrim-start-strong`. */
  readonly scrim?: string;
  /** Minimum heights per page (Figma: About 620/500, Services 600/460, Projects 560/420). */
  readonly heightClassName?: string;
  readonly className?: string;
  readonly children?: ReactNode;
};

/**
 * Figma "Page Hero": photo, scrim, breadcrumb, Display/L title (bold accent word), intro and
 * optional mini-stats. Always dark (text sits on a photo); the site header overlays the top.
 */
export function PageHero({
  image,
  title,
  intro,
  introShort,
  breadcrumbs,
  breadcrumbLabel,
  stats,
  scrim = "scrim-down-70",
  heightClassName = "min-h-125 lg:min-h-155",
  className,
  children,
}: PageHeroProps) {
  return (
    <header
      className={classNames(
        "scheme-dark relative isolate flex items-end overflow-hidden bg-canvas pt-36 pb-8 text-primary lg:pb-22.5",
        heightClassName,
        className,
      )}
      data-section="page-hero"
    >
      <Image alt={image.alt} className="-z-20 object-cover" fill priority quality={60} sizes="100vw" src={image.src} />
      <span aria-hidden="true" className={classNames("absolute inset-0 -z-10 max-lg:scrim-down-60", scrim)} />
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-190 flex-col gap-3 lg:gap-5">
          <Breadcrumb items={breadcrumbs} label={breadcrumbLabel} />
          <h1 className="font-display text-display-l">
            <AccentText accentClassName="font-bold" breakClassName="max-md:hidden" value={title} />
          </h1>
          {intro ? <p className={classNames("max-w-190 text-body-l text-secondary", introShort && "max-md:hidden")}>{intro}</p> : null}
          {introShort ? <p className="text-body-l text-secondary md:hidden">{introShort}</p> : null}
          {children}
        </div>
        {stats && stats.length > 0 ? (
          <dl className="flex gap-14 max-md:hidden">
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
