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
 * hairline footer. Cards in a grid row stretch to one height; the footer sits at the bottom (mt-auto) so dividers align.
 */
export function ServiceCard({ number, title, description, icon, href, linkLabel, featured = false, className }: ServiceCardProps) {
  return (
    <CardFrame className={className} featured={featured} href={href}>
      <div className="flex flex-1 flex-col px-7.5 pt-7.5 pb-6.5">
        <Numeral featured={featured} value={number} />
        <IconTile featured={featured} name={icon} />
        <h3
          className={classNames(
            "mt-6.5 line-clamp-2 min-h-[64px] font-display text-[length:var(--text-h3)] leading-[32px] font-bold",
            featured ? "text-white" : "text-primary",
          )}
        >
          {title}
        </h3>
        <p
          className={classNames(
            "mt-2.5 line-clamp-3 min-h-[72px] text-[length:var(--text-body-s)] leading-[24px]",
            featured ? "text-[var(--navy-200)]" : "text-secondary",
          )}
        >
          {description ?? ""}
        </p>
        {linkLabel ? (
          <div className="mt-auto pt-5.5" data-card-footer="">
            <div
              className={
                featured
                  ? "flex items-center justify-between border-t border-white/10 pt-4.5 text-[0.9375rem] leading-[24px] font-medium text-green-300"
                  : "flex items-center justify-between border-t border-line pt-4.5 text-[0.9375rem] leading-[24px] font-medium text-accent"
              }
            >
              <span>{linkLabel}</span>
              <ArrowDisc featured={featured} />
            </div>
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
      <div className="flex flex-1 flex-col px-7.5 pt-7.5 pb-6.5">
        <Numeral featured={featured} value={number} />
        <IconTile featured={featured} name={icon} />
        <h3
          className={classNames(
            "mt-6.5 line-clamp-2 min-h-[64px] font-display text-[length:var(--text-h3)] leading-[32px] font-bold",
            featured ? "text-white" : "text-primary",
          )}
        >
          {title}
        </h3>
        <ul className="mt-4 grid gap-x-4 gap-y-2.5 lg:grid-cols-2">
          {items.map((item) => (
            <li className={classNames("flex items-start gap-2 text-[length:var(--text-body-s)] leading-[24px]", featured ? "text-[var(--navy-200)]" : "text-secondary")} key={item}>
              <Icon className={classNames("mt-0.5 size-4 shrink-0", featured ? "text-green-300" : "text-accent")} name="check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-5.5" data-card-footer="">
          <p
            className={
              featured
                ? "border-t border-white/10 pt-4.5 text-[0.9375rem] leading-[24px] font-medium text-green-300"
                : "border-t border-line pt-4.5 text-[0.9375rem] leading-[24px] font-medium text-accent"
            }
          >
            {countLabel}
          </p>
        </div>
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
      <div className="flex flex-1 flex-col px-6 pt-6 pb-5">
        <IconTile compact name={icon} />
        <h3 className="mt-4 line-clamp-2 font-display text-h4 font-bold text-primary">{title}</h3>
        {description ? <p className="mt-2 line-clamp-3 text-body-s text-secondary">{description}</p> : null}
      </div>
    </CardFrame>
  );
}
