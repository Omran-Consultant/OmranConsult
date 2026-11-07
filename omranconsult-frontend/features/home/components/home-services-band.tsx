"use client";

import Image from "next/image";
import { useState } from "react";

import { getProfileImageAlt, type ProfileImage } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

export type ServicesBandItem = {
  readonly title?: string;
  readonly image: ProfileImage;
  readonly grow: number;
};

type HomeServicesBandProps = {
  readonly items: readonly ServicesBandItem[];
  readonly locale: AppLocale;
};

export function HomeServicesBand({ items, locale }: HomeServicesBandProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  return (
    <div className="band-row flex min-h-115 overflow-hidden md:min-h-[68svh]">
      {items.map((item, index) => {
        const grow = activeIndex === index ? 6 : item.grow;
        return (
          <figure
            className="relative m-0 min-w-0 overflow-hidden bg-canvas transition-[flex-grow] duration-500 ease-out"
            key={`${item.title ?? "band"}-${index}`}
            onBlur={() => setActiveIndex(undefined)}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
            style={{ flexGrow: grow, flexBasis: 0 }}
          >
            <Image
              alt={getProfileImageAlt(item.image, locale)}
              className="absolute inset-0 h-full w-full object-cover"
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              src={item.image.src}
            />
            {item.title ? (
              <figcaption className="absolute start-0 top-0 z-1 max-w-[90%] rounded-ee-(--radius-lg) bg-canvas/55 px-6 pt-6 pb-10 font-display text-xl font-bold text-white md:text-2xl">
                {item.title}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
