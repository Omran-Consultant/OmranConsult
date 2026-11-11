import Image from "next/image";

import { classNames } from "@/core/ui/class-names";
import type { ImageAsset } from "@/core/ui/image-asset";

type FillImageProps = {
  readonly image: ImageAsset;
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  readonly quality?: number;
  readonly fit?: "cover" | "contain";
};

/**
 * The LCP image: fetch now at high priority. Next 16 maps `priority` to a preload only, without
 * `fetchpriority`, and its docs recommend these two attributes instead.
 */
export const LCP_IMAGE = { fetchPriority: "high", loading: "eager" } as const;

/**
 * Uses the media library srcset when the API generated WebP sizes.
 * next/image stays on the path that has no derivative set, so existing photos keep their current optimizer output.
 */
export function FillImage({ image, sizes, className, priority = false, quality, fit = "cover" }: FillImageProps) {
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  if (image.srcSet) {
    return (
      // The srcset is the sized WebP set from the API. next/image would build a second set from one URL.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={image.alt}
        className={classNames("absolute inset-0 size-full", fitClass, className)}
        decoding="async"
        {...(priority ? LCP_IMAGE : { loading: "lazy" as const })}
        sizes={sizes}
        src={image.src}
        srcSet={image.srcSet}
      />
    );
  }

  return <Image alt={image.alt} className={classNames(fitClass, className)} fill {...(priority ? LCP_IMAGE : {})} quality={quality} sizes={sizes} src={image.src} />;
}
