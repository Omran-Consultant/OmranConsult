import Image from "next/image";
import type { CSSProperties } from "react";

export type PartnerCardData = {
  readonly slug: string;
  readonly name: string;
  readonly field?: string;
  readonly logo?: {
    readonly src: string;
    readonly width: number;
    readonly height: number;
  };
};

type PartnerGridProps = {
  readonly partners: readonly PartnerCardData[];
  /** Id of the one group heading that names this list. Home's «شركاؤنا» label. */
  readonly labelId?: string;
};

/**
 * The About «شركاؤنا» card (A34): logo on a white panel, name, and field.
 * Home and About share this markup.
 */
export function PartnerGrid({ partners, labelId }: PartnerGridProps) {
  if (partners.length === 0) {
    return null;
  }

  return (
    <ul aria-labelledby={labelId} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {partners.map((partner, index) => (
        <li
          className="glass flex flex-col gap-5 rounded-lg border border-line p-6"
          data-reveal=""
          key={partner.slug}
          style={{ "--reveal-index": index } as CSSProperties}
        >
          <div className="flex h-24 items-center justify-center rounded-md bg-white px-6">
            {partner.logo ? (
              <Image
                alt={partner.name}
                className="max-h-16 w-auto object-contain"
                height={partner.logo.height}
                sizes="200px"
                src={partner.logo.src}
                width={partner.logo.width}
              />
            ) : null}
          </div>
          <h3 className="font-display text-h4 text-primary">{partner.name}</h3>
          {partner.field ? <p className="text-body-s text-secondary">{partner.field}</p> : null}
        </li>
      ))}
    </ul>
  );
}
