import { CardFrame } from "@/core/ui/card-frame";
import { classNames } from "@/core/ui/class-names";
import { FillImage } from "@/core/ui/fill-image";
import type { ImageAsset } from "@/core/ui/image-asset";

type ProjectCardProps = {
  readonly href: string;
  readonly title: string;
  readonly image: ImageAsset;
  readonly category?: string;
  readonly client?: string;
  /** The Home bento lead card uses a taller image. */
  readonly emphasis?: "standard" | "tall";
  readonly sizes?: string;
  readonly priority?: boolean;
  readonly className?: string;
};

/**
 * Project card option A (A36): 16:10 image, sector, two-line title, client.
 * The whole card is the link. Hover zooms the image, lifts the card, and turns the title green.
 */
export function ProjectCard({
  href,
  title,
  image,
  category,
  client,
  emphasis = "standard",
  sizes = "(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
}: ProjectCardProps) {
  return (
    <CardFrame className={className} glow={false} href={href}>
      <div className={classNames("relative overflow-hidden bg-highlight", emphasis === "tall" ? "min-h-72 flex-1" : "aspect-[16/10]")}>
        <FillImage
          className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:md:group-hover:scale-[1.04] motion-safe:md:group-focus-visible:scale-[1.04]"
          image={image}
          priority={priority}
          sizes={sizes}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 bg-surface px-6 py-5">
        {category ? <span className="text-label-s text-accent">{category}</span> : null}
        <span className="line-clamp-2 text-pretty font-display text-h3 font-bold text-primary transition-colors duration-[250ms] ease-out md:group-hover:text-accent md:group-focus-visible:text-accent">{title}</span>
        {client ? (
          <span className="mt-auto truncate pt-1 text-body-s text-secondary" data-card-footer="">
            {client}
          </span>
        ) : null}
      </div>
    </CardFrame>
  );
}
