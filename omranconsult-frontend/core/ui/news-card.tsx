import Image from "next/image";

import { CardFrame } from "@/core/ui/card-frame";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";

type NewsCardProps = {
  readonly href: string;
  readonly image: ImageAsset;
  readonly title: string;
  readonly category?: string;
  readonly date?: string;
  readonly dateTime?: string;
  readonly excerpt?: string;
  readonly linkLabel: string;
  /** Featured post: the same anatomy with a taller image and an h2 title. */
  readonly emphasis?: "standard" | "featured";
  readonly titleId?: string;
  readonly className?: string;
};

/** News card option A (A36): image, category and date, title, excerpt, read-more row. */
export function NewsCard({
  href,
  image,
  title,
  category,
  date,
  dateTime,
  excerpt,
  linkLabel,
  emphasis = "standard",
  titleId,
  className,
}: NewsCardProps) {
  const Title = emphasis === "featured" ? "h2" : "h3";

  return (
    <CardFrame className={className} glow={false} href={href}>
      <div className={classNames("relative overflow-hidden bg-highlight", emphasis === "featured" ? "aspect-[16/7] min-h-60" : "aspect-[16/10]")}>
        <Image
          alt={image.alt}
          className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:md:group-hover:scale-[1.04] motion-safe:md:group-focus-visible:scale-[1.04]"
          fill
          sizes={emphasis === "featured" ? "(min-width: 1024px) 1200px, 100vw" : "(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw"}
          src={image.src}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-surface px-6 py-5">
        {category || date ? (
          <p className="flex items-center gap-2.5 text-caption">
            {category ? <span className="text-accent">{category}</span> : null}
            {category && date ? <span aria-hidden="true" className="size-1 rounded-full bg-muted" /> : null}
            {date ? (
              <time className="text-muted" dateTime={dateTime}>
                {date}
              </time>
            ) : null}
          </p>
        ) : null}
        <Title className={classNames("line-clamp-2 text-pretty font-display font-bold text-primary transition-colors duration-[250ms] ease-out md:group-hover:text-accent md:group-focus-visible:text-accent", emphasis === "featured" ? "text-h2" : "text-h4")} id={titleId}>
          {title}
        </Title>
        {excerpt ? <p className="line-clamp-3 text-body-s text-secondary">{excerpt}</p> : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-1 text-label-m text-accent" data-card-footer="">
          <span>{linkLabel}</span>
          <Icon name="arrow" />
        </span>
      </div>
    </CardFrame>
  );
}
