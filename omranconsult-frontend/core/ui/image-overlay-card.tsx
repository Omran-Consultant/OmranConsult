import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { FillImage } from "@/core/ui/fill-image";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { Link } from "@/i18n/navigation";

type OverlayChip = {
  readonly label: string;
};

type ImageOverlayCardProps = {
  readonly href: string;
  readonly image: ImageAsset;
  readonly title: string;
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly className?: string;
  readonly chips?: readonly OverlayChip[];
  readonly category?: string;
  readonly footer?: ReactNode;
  readonly largeTitle?: boolean;
  readonly titleId?: string;
  readonly titleAs?: "h2" | "h3";
};

/**
 * Figma project / image card: full-bleed photo, bottom scrim, optional glass chips, round arrow.
 * The caller sets the size through className, because each screen has its own Figma card size.
 */
export function ImageOverlayCard({
  href,
  image,
  title,
  sizes = "(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
  chips = [],
  category,
  footer,
  largeTitle = false,
  titleId,
  titleAs = "h3",
}: ImageOverlayCardProps) {
  const Title = titleAs;

  return (
    <Link
      className={classNames(
        "group relative isolate flex w-full flex-col overflow-hidden rounded-[20px] bg-[var(--navy-900)] text-white shadow-card [&_img]:absolute [&_img]:inset-0 [&_img]:size-full",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      href={href}
    >
      <FillImage
        className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:md:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
        image={image}
        priority={priority}
        sizes={sizes}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--navy-950)_12%,transparent)_20%,color-mix(in_srgb,var(--navy-950)_88%,transparent)_78%,color-mix(in_srgb,var(--navy-950)_96%,transparent)_100%)]"
      />
      {chips.length > 0 ? (
        <ul aria-label={undefined} className="absolute top-5 end-5 z-10 flex flex-wrap justify-end gap-2">
          {chips.map((chip) => (
            <li
              className="num-isolate rounded-full border border-white/20 bg-white/6 px-3.5 py-1.5 text-caption text-white backdrop-blur-sm"
              key={chip.label}
            >
              {chip.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="relative z-10 mt-auto flex flex-col gap-2.5 p-6 scheme-dark">
        {category ? <span className="text-label-s text-green-300">{category}</span> : null}
        <Title
          className={classNames(
            "line-clamp-2 text-pretty font-display font-bold text-white",
            largeTitle ? "text-h2" : "text-h3",
          )}
          id={titleId}
        >
          {title}
        </Title>
        <div className="flex items-center justify-between gap-3 pt-1" data-card-footer="">
          {footer ? <div className="min-w-0 flex-1">{footer}</div> : null}
          <span
            aria-hidden="true"
            className="ms-auto inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--navy-950)] transition-colors duration-[250ms] ease-out motion-safe:md:group-hover:bg-green-300 motion-safe:group-focus-visible:bg-green-300"
          >
            <Icon className="size-4.5" name="arrow" />
          </span>
        </div>
      </div>
    </Link>
  );
}
