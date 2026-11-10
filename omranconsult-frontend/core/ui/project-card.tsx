import { ImageOverlayCard } from "@/core/ui/image-overlay-card";
import type { ImageAsset } from "@/core/ui/image-asset";

type ProjectCardProps = {
  readonly href: string;
  readonly title: string;
  readonly image: ImageAsset;
  readonly category?: string;
  readonly client?: string;
  readonly region?: string;
  readonly year?: number;
  /** The Home bento lead card stretches to the two-row cell height. */
  readonly emphasis?: "standard" | "tall";
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
  emphasis = "standard",
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
      className={className}
      emphasis={emphasis}
      footer={client ? <span className="truncate text-body-s text-[var(--navy-200)]">{client}</span> : undefined}
      href={href}
      image={image}
      priority={priority}
      sizes={sizes}
      title={title}
    />
  );
}
