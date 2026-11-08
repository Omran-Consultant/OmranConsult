import Image from "next/image";

import { classNames } from "@/core/ui/class-names";
import type { ImageAsset } from "@/core/ui/image-asset";

/**
 * Decorative hero element (Figma Hero): the earth photo inside two concentric rings (inner radius
 * 80 % and 62 %) and a thin accent arc, rotating in on load. Desktop: 1180 px at the reading end;
 * mobile: 620 px at the top, towards the start. Hidden from assistive technology.
 */
export function HeroRings({ image }: { readonly image: ImageAsset }) {
  const ring = (className: string, mask: string, sizes: string) => (
    <span className={classNames("absolute overflow-hidden rounded-full", mask, className)}>
      <Image alt="" className="object-cover" fill loading="eager" quality={60} sizes={sizes} src={image.src} />
    </span>
  );

  return (
    <span
      aria-hidden="true"
      className={classNames(
        "pointer-events-none absolute -z-10 aspect-square animate-ring-in",
        // Mobile and tablet (Figma Mobile Hero): 620 px, 120 px above the top, 190 px past the start.
        "-start-[190px] -top-30 w-155",
        // Laptop and desktop (Figma Hero): 1180 px, 120 px above the top, 500 px past the end.
        "lg:start-auto lg:-end-[380px] lg:-top-[90px] lg:w-225 xl:-end-[500px] xl:-top-30 xl:w-295",
      )}
    >
      {ring("inset-0", "ring-mask-80", "(min-width: 1280px) 1180px, (min-width: 1024px) 900px, 620px")}
      {/* The inner shape is a full disc (Figma "img/earth" 820): the dark band between it and the outer ring is the gap. */}
      <span className="absolute inset-[15.25%] overflow-hidden rounded-full">
        <Image alt="" className="object-cover" fill loading="eager" quality={60} sizes="(min-width: 1280px) 820px, (min-width: 1024px) 625px, 420px" src={image.src} />
      </span>
      <span className="arc-fade absolute -inset-[3px] rounded-full border-[3px] border-accent" />
    </span>
  );
}
