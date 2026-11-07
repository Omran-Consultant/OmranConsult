import Image from "next/image";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { Link } from "@/i18n/navigation";

type NewsCardProps = {
  readonly href: string;
  readonly image: ImageAsset;
  readonly title: string;
  readonly category?: string;
  readonly date?: string;
  readonly dateTime?: string;
  readonly excerpt?: string;
  readonly linkLabel: string;
  readonly className?: string;
};

/** Figma "News Card": image 240, body padding 22/24, gap 14; title 2 lines, excerpt 3 lines. */
export function NewsCard({ href, image, title, category, date, dateTime, excerpt, linkLabel, className }: NewsCardProps) {
  return (
    <article
      className={classNames(
        "group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-150 hover:border-line-accent",
        className,
      )}
    >
      <div className="relative h-60 overflow-hidden bg-highlight">
        <Image
          alt={image.alt}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          fill
          sizes="(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw"
          src={image.src}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3.5 px-6 py-5.5">
        <p className="flex items-center gap-2.5 text-caption">
          {category ? <span className="text-accent">{category}</span> : null}
          {category && date ? <span aria-hidden="true" className="size-1 rounded-full bg-muted" /> : null}
          {date ? (
            <time className="text-muted" dateTime={dateTime}>
              {date}
            </time>
          ) : null}
        </p>
        <h3 className="line-clamp-2 font-display text-h4 text-primary">{title}</h3>
        {excerpt ? <p className="line-clamp-3 text-body-s text-secondary">{excerpt}</p> : null}
        <Link
          className="mt-auto inline-flex items-center gap-3 self-start py-1.5 text-label-m text-accent transition-colors duration-150 after:absolute after:inset-0 hover:text-primary"
          href={href}
        >
          <span>{linkLabel}</span>
          <Icon className="text-accent" name="arrow" />
        </Link>
      </div>
    </article>
  );
}
