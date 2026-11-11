import Image from "next/image";

export type LogoTileData = {
  readonly key: string;
  readonly name?: string;
  readonly logo?: {
    readonly src: string;
    readonly width: number;
    readonly height: number;
  };
};

type LogoTileGridProps = {
  readonly tiles: readonly LogoTileData[];
  /** Accessible name for a logo whose record has no name yet. */
  readonly fallbackAlt: string;
};

/**
 * Client logo tiles as on the profile clients page (SITE_TWEAKS_2 C2): 5 columns on desktop, 3:1 white
 * tiles with a thin green border, the logo centred at about 62 % of the tile height. The tile stays
 * white in the dark theme because the logos are drawn for a white ground. About and Projects share it.
 */
export function LogoTileGrid({ tiles, fallbackAlt }: LogoTileGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {tiles.map((tile) => (
        <li
          className="relative flex aspect-3/1 items-center justify-center rounded-[14px] border border-accent-strong/55 bg-white dark:border-line-strong"
          data-logo-tile=""
          key={tile.key}
        >
          {tile.logo ? (
            <Image
              alt={tile.name ?? fallbackAlt}
              className="object-contain px-[10%] py-[6.3%]"
              fill
              sizes="(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              src={tile.logo.src}
            />
          ) : (
            <span className="line-clamp-2 px-3 text-center text-body-s text-navy-950">{tile.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
