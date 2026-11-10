import { classNames } from "@/core/ui/class-names";
import { ImageOverlayCard } from "@/core/ui/image-overlay-card";
import type { ImageAsset } from "@/core/ui/image-asset";

/** Figma card sizes as ratios, so other widths scale from the frames (V5). */
const CARD_LAYOUTS = {
  /** Home bento 740×640; the two stacked side cards set the height of its row. */
  lead: "h-full aspect-[740/640]",
  side: "aspect-[516/308]",
  row: "aspect-[411/460]",
  list: "aspect-[350/400] md:aspect-[411/480]",
  related: "aspect-[350/400] md:aspect-[411/440]",
  carousel: "aspect-[300/420]",
} as const;

type ProjectCardProps = {
  readonly href: string;
  readonly title: string;
  readonly image: ImageAsset;
  readonly category?: string;
  readonly client?: string;
  readonly region?: string;
  readonly year?: number;
  readonly layout: keyof typeof CARD_LAYOUTS;
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly className?: string;
};

/** Figma project card: image overlay, sector, title, client, region/year chips when present. */
export function ProjectCard({
  href,
  title,
  image,
  category,
  client,
  region,
  year,
  layout,
  sizes = "(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
}: ProjectCardProps) {
  const chips = [
    ...(year ? [{ label: String(year) }] : []),
    ...(region ? [{ label: region }] : []),
  ];

  return (
    <ImageOverlayCard
      category={category}
      chips={chips}
      className={classNames(CARD_LAYOUTS[layout], className)}
      footer={client ? <span className="truncate text-body-s text-[var(--navy-200)]">{client}</span> : undefined}
      href={href}
      image={image}
      priority={priority}
      sizes={sizes}
      title={title}
    />
  );
}
