import { ImageOverlayCard } from "@/core/ui/image-overlay-card";
import { classNames } from "@/core/ui/class-names";
import type { ImageAsset } from "@/core/ui/image-asset";

type NewsCardProps = {
  readonly href: string;
  readonly image: ImageAsset;
  readonly title: string;
  readonly category?: string;
  readonly date?: string;
  readonly dateTime?: string;
  readonly readTime?: string;
  readonly excerpt?: string;
  readonly linkLabel?: string;
  /** Featured post: wide overlay card; compact list omits the excerpt. */
  readonly emphasis?: "standard" | "featured";
  readonly titleId?: string;
  readonly className?: string;
};

/** Media centre card (SITE_TWEAKS T2): same overlay language as the Figma project card. */
export function NewsCard({
  href,
  image,
  title,
  category,
  date,
  dateTime,
  readTime,
  excerpt,
  emphasis = "standard",
  titleId,
  className,
}: NewsCardProps) {
  const meta = [date, readTime].filter(Boolean);

  return (
    <div className={classNames("flex h-full min-w-0 flex-col", className)}>
      <ImageOverlayCard
        category={category}
        className="flex-1"
        emphasis={emphasis === "featured" ? "featured" : "standard"}
        footer={
          meta.length > 0 ? (
            <p className="flex flex-wrap items-center justify-end gap-2 text-caption text-[var(--navy-200)]">
              {date ? (
                <time className="num-isolate" dateTime={dateTime}>
                  {date}
                </time>
              ) : null}
              {date && readTime ? <span aria-hidden="true" className="size-1 rounded-full bg-[color-mix(in_srgb,var(--navy-200)_70%,transparent)]" /> : null}
              {readTime ? <span>{readTime}</span> : null}
            </p>
          ) : undefined
        }
        href={href}
        image={image}
        sizes={emphasis === "featured" ? "(min-width: 1024px) 1200px, 100vw" : "(min-width: 1024px) 410px, (min-width: 768px) 50vw, 100vw"}
        title={title}
        titleAs={emphasis === "featured" ? "h2" : "h3"}
        titleId={titleId}
      />
      {emphasis === "featured" && excerpt ? (
        <p className="mt-4 line-clamp-3 text-body-s text-secondary">{excerpt}</p>
      ) : null}
    </div>
  );
}
