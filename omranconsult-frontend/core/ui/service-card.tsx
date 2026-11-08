import { ArrowDisc, CardFrame, IconTile, Numeral } from "@/core/ui/card-frame";
import { classNames } from "@/core/ui/class-names";
import { Icon, type IconName } from "@/core/ui/icon";

type ServiceCardProps = {
  readonly number: string;
  readonly title: string;
  readonly description?: string;
  readonly icon: IconName;
  readonly href?: string;
  readonly linkLabel?: string;
  /** The first Home card uses the navy featured surface. */
  readonly featured?: boolean;
  readonly className?: string;
};

/**
 * Service highlight (A36 concept): tile, outlined numeral, title, three-line description,
 * hairline footer. Height follows the content; the footer is not pushed by an empty flex gap.
 */
export function ServiceCard({ number, title, description, icon, href, linkLabel, featured = false, className }: ServiceCardProps) {
  return (
    <CardFrame className={className} featured={featured} href={href}>
      <div className="flex flex-col px-7.5 pt-7.5 pb-6.5">
        <Numeral featured={featured} value={number} />
        <IconTile featured={featured} name={icon} />
        <h3 className={classNames("mt-6.5 font-display text-h3 font-bold", featured ? "text-white" : "text-primary")}>{title}</h3>
        {description ? (
          <p className={classNames("mt-2.5 line-clamp-3 text-[0.969rem] leading-[1.75]", featured ? "text-[var(--navy-200)]" : "text-secondary")}>
            {description}
          </p>
        ) : null}
        {linkLabel ? (
          <div
            className={
              featured
                ? "mt-5.5 flex items-center justify-between border-t border-white/10 pt-4.5 text-[0.9375rem] font-medium text-green-300"
                : "mt-5.5 flex items-center justify-between border-t border-line pt-4.5 text-[0.9375rem] font-medium text-accent"
            }
          >
            <span>{linkLabel}</span>
            <ArrowDisc featured={featured} />
          </div>
        ) : null}
      </div>
    </CardFrame>
  );
}

type AxisCardProps = {
  readonly number: string;
  readonly title: string;
  readonly icon: IconName;
  readonly items: readonly string[];
  readonly countLabel: string;
  readonly featured?: boolean;
};

/** Same shell as the service card. The body is the full API checklist; the footer is the count. */
export function AxisCard({ number, title, icon, items, countLabel, featured = false }: AxisCardProps) {
  return (
    <CardFrame featured={featured}>
      <div className="flex flex-col px-7.5 pt-7.5 pb-6.5">
        <Numeral featured={featured} value={number} />
        <IconTile featured={featured} name={icon} />
        <h3 className={classNames("mt-6.5 font-display text-h3 font-bold", featured ? "text-white" : "text-primary")}>{title}</h3>
        <ul className="mt-4 grid gap-x-4 gap-y-2.5 lg:grid-cols-2">
          {items.map((item) => (
            <li className={classNames("flex items-start gap-2 text-body-s", featured ? "text-[var(--navy-200)]" : "text-secondary")} key={item}>
              <Icon className={classNames("mt-0.5 size-4 shrink-0", featured ? "text-green-300" : "text-accent")} name="check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p
          className={
            featured
              ? "mt-5.5 border-t border-white/10 pt-4.5 text-[0.9375rem] font-medium text-green-300"
              : "mt-5.5 border-t border-line pt-4.5 text-[0.9375rem] font-medium text-accent"
          }
        >
          {countLabel}
        </p>
      </div>
    </CardFrame>
  );
}

type ToolCardProps = {
  readonly title: string;
  readonly description?: string;
  readonly icon: IconName;
};

/** Compact service shell: 44 px tile, no numeral. The description stays at three lines. */
export function ToolCard({ title, description, icon }: ToolCardProps) {
  return (
    <CardFrame>
      <div className="flex flex-col px-6 pt-6 pb-5">
        <IconTile compact name={icon} />
        <h3 className="mt-4 font-display text-h4 font-bold text-primary">{title}</h3>
        {description ? <p className="mt-2 line-clamp-3 text-body-s text-secondary">{description}</p> : null}
      </div>
    </CardFrame>
  );
}
