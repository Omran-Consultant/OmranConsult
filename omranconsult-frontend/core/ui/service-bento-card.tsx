import { classNames } from "@/core/ui/class-names";
import { CardFrame, IconTile } from "@/core/ui/card-frame";
import { Icon, type IconName } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { FillImage } from "@/core/ui/fill-image";

/** Concept A's small muted card number; decorative because the order is the list order. */
function CardNumber({ value, featured = false }: { readonly value: string; readonly featured?: boolean }) {
  return (
    <span aria-hidden="true" className={classNames("num-isolate font-latin text-label-m", featured ? "text-white/40" : "text-muted")}>
      {value}
    </span>
  );
}

type ServiceBentoFeaturedProps = {
  readonly number: string;
  readonly title: string;
  readonly description?: string;
  readonly icon: IconName;
  readonly href?: string;
  readonly linkLabel?: string;
  readonly items: readonly string[];
  readonly image: ImageAsset;
};

/** Concept A featured cell: photo, scrim, three capability chips from the API. */
export function ServiceBentoFeatured({ number, title, description, icon, href, linkLabel, items, image }: ServiceBentoFeaturedProps) {
  return (
    <CardFrame className="h-[380px] border-transparent" glow={false} href={href}>
      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <FillImage className="opacity-90" image={image} sizes="(min-width: 1280px) 640px, 100vw" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--navy-950)_10%,transparent)_15%,color-mix(in_srgb,var(--navy-950)_92%,transparent)_85%)]"
        />
        <div className="relative z-10 flex h-full flex-col px-6 pt-6 text-white scheme-dark lg:px-7 lg:pt-7">
          <div className="flex items-start justify-between gap-4">
            <IconTile featured name={icon} />
            <CardNumber featured value={number} />
          </div>
          <div className="flex flex-1 flex-col gap-3.5 pt-6">
            <h3 className="font-display text-h2 font-bold text-white">{title}</h3>
            {description ? <p className="line-clamp-2 max-w-md text-body-m text-[var(--navy-200)]">{description}</p> : null}
            {items.length > 0 ? (
              <ul className="flex flex-wrap gap-2.5">
                {items.map((item) => (
                  <li
                    className="flex max-w-full items-center gap-1.5 rounded-full bg-white/12 px-3.5 py-1.5 text-caption text-white backdrop-blur-sm"
                    key={item}
                  >
                    <Icon className="size-3.5 shrink-0 text-green-300" name="check" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {linkLabel ? (
            <div className="mt-auto flex h-14 shrink-0 items-center border-t border-white/10" data-card-footer="">
              <span className="inline-flex items-center gap-2 text-label-m text-green-300">
                <span>{linkLabel}</span>
                <Icon name="arrow" />
              </span>
            </div>
          ) : (
            <div className="h-14 shrink-0" />
          )}
        </div>
      </div>
    </CardFrame>
  );
}

type ServiceBentoStandardProps = {
  readonly number: string;
  readonly title: string;
  readonly description?: string;
  readonly icon: IconName;
  readonly href?: string;
  readonly linkLabel?: string;
};

export function ServiceBentoStandard({ number, title, description, icon, href, linkLabel }: ServiceBentoStandardProps) {
  return (
    <CardFrame className="h-[380px] bg-surface dark:[background-color:var(--bg-elevated)]" glow={false} href={href}>
      <div className="flex h-full flex-1 flex-col px-6 pt-6 lg:px-7 lg:pt-7">
        <div className="flex items-start justify-between gap-3">
          <IconTile name={icon} />
          <CardNumber value={number} />
        </div>
        <div className="flex flex-1 flex-col pt-7">
          <h3 className="line-clamp-2 font-display text-h3 font-bold text-primary">{title}</h3>
          {description ? <p className="mt-2.5 line-clamp-3 text-body-s text-secondary">{description}</p> : null}
        </div>
        {linkLabel ? (
          <div className="mt-auto flex h-14 shrink-0 items-center border-t border-line" data-card-footer="">
            <span className="inline-flex items-center gap-2 text-label-m text-accent">
              <span>{linkLabel}</span>
              <Icon name="arrow" />
            </span>
          </div>
        ) : (
          <div className="h-14 shrink-0" />
        )}
      </div>
    </CardFrame>
  );
}

type ServiceBentoCtaProps = {
  readonly title: string;
  readonly description?: string;
  readonly href: string;
  readonly linkLabel: string;
};

export function ServiceBentoCta({ title, description, href, linkLabel }: ServiceBentoCtaProps) {
  return (
    <CardFrame
      className="h-[380px] border-transparent bg-[linear-gradient(160deg,var(--green-700),var(--green-600))] text-white shadow-card"
      glow={false}
      href={href}
    >
      <div className="flex h-full flex-1 flex-col px-6 pt-6 lg:px-7 lg:pt-7">
        <span className="inline-flex size-14 items-center justify-center rounded-[14px] bg-white/16 text-white">
          <Icon className="size-6.5" name="mail" weight="duotone" />
        </span>
        <div className="flex flex-1 flex-col gap-3 pt-4">
          <h3 className="font-display text-h3 font-bold text-white">{title}</h3>
          {description ? <p className="line-clamp-3 text-body-s text-white/90">{description}</p> : null}
        </div>
        <div className="mt-auto flex h-14 shrink-0 items-center border-t border-white/20" data-card-footer="">
          <span className="inline-flex items-center gap-2 text-label-m text-white">
            <span>{linkLabel}</span>
            <Icon name="arrow" />
          </span>
        </div>
      </div>
    </CardFrame>
  );
}
