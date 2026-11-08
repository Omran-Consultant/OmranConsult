import { classNames } from "@/core/ui/class-names";
import { Icon, type IconName } from "@/core/ui/icon";
import { Link } from "@/i18n/navigation";

type ServiceCardProps = {
  readonly number: string;
  readonly title: string;
  readonly description?: string;
  readonly icon: IconName;
  readonly href?: string;
  readonly linkLabel?: string;
  /** The first card is green-tinted (spec). */
  readonly highlighted?: boolean;
  readonly className?: string;
};

/**
 * Figma "Service Card": glass background, padding 32, gap 20, number + icon box,
 * title (Heading/H3), description (3 lines), ghost link. Hover: accent border.
 */
export function ServiceCard({
  number,
  title,
  description,
  icon,
  href,
  linkLabel,
  highlighted = false,
  className,
}: ServiceCardProps) {
  return (
    <article
      className={classNames(
        "group relative flex flex-col gap-5 rounded-lg border p-8 transition-colors duration-150 hover:border-line-accent",
        // The tint applies from tablet up; the 390 frame shows every card plain.
        highlighted ? "glass border-line md:border-line-accent md:bg-accent-strong/12" : "glass border-line",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-13.5 items-center justify-center rounded-[14px] border border-line-accent bg-accent-strong text-green-300">
          <Icon className="size-6" name={icon} />
        </span>
        <span className="num-isolate mt-5 font-latin text-overline text-muted">{number}</span>
      </div>
      <div className="mt-auto flex flex-col gap-5 lg:pt-12">
        <h3 className="font-display text-h3 text-primary">{title}</h3>
        {description ? <p className="line-clamp-3 text-body-s text-secondary">{description}</p> : null}
        {href && linkLabel ? (
          <Link
            className="inline-flex items-center gap-3 self-start py-1.5 text-label-m text-accent transition-colors duration-150 after:absolute after:inset-0 after:rounded-lg hover:text-primary"
            href={href}
          >
            <span>{linkLabel}</span>
            <Icon className="text-accent" name="arrow" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
