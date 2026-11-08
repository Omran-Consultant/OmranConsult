import Image from "next/image";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { Link } from "@/i18n/navigation";

type ProjectCardProps = {
  readonly href: string;
  readonly title: string;
  readonly image: ImageAsset;
  readonly category?: string;
  readonly client?: string;
  readonly location?: string;
  /** Hidden when null (spec: missing data). */
  readonly year?: number | string;
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly className?: string;
};

const chipClassName =
  "rounded-full border border-line-strong bg-glass px-3.5 py-1.5 text-caption text-primary backdrop-blur-md";

/**
 * Figma "Project Card": full-bleed image, dark gradient from 45 % down, chips, category,
 * title (2 lines), client and the arrow button. The whole card is one link.
 */
export function ProjectCard({
  href,
  title,
  image,
  category,
  client,
  location,
  year,
  sizes = "(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
}: ProjectCardProps) {
  const hasChips = Boolean(location) || year !== undefined;

  return (
    <Link
      className={classNames(
        "scheme-dark group relative isolate flex flex-col justify-end overflow-hidden rounded-lg bg-highlight p-6 text-primary",
        className,
      )}
      href={href}
    >
      <Image
        alt={image.alt}
        className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        fill
        priority={priority}
        sizes={sizes}
        src={image.src}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-45% to-navy-950/95"
      />

      {hasChips ? (
        <span className="absolute inset-x-6 top-6 flex flex-wrap justify-start gap-2">
          {location ? <span className={chipClassName}>{location}</span> : null}
          {year !== undefined ? (
            <span className={classNames(chipClassName, "num-isolate")}>{year}</span>
          ) : null}
        </span>
      ) : null}

      <span className="flex flex-col gap-2.5">
        {category ? <span className="text-label-s text-accent">{category}</span> : null}
        <span className="line-clamp-2 font-display text-h3">{title}</span>
        <span className="flex items-center justify-between gap-4 pt-2.5">
          <span className="truncate text-body-s text-secondary">{client}</span>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-navy-950 transition-colors duration-150 group-hover:bg-accent-strong group-hover:text-white"
          >
            <Icon name="arrow" />
          </span>
        </span>
      </span>
    </Link>
  );
}
