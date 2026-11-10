import Image from "next/image";

import { classNames } from "@/core/ui/class-names";
import type { ImageAsset } from "@/core/ui/image-asset";

type FillImageProps = {
  readonly image: ImageAsset;
  readonly sizes: string;
  readonly className?: string;
  readonly priority?: boolean;
  readonly quality?: number;
};

/**
 * Uses the media library srcset when the API generated WebP sizes.
 * next/image stays on the path that has no derivative set, so existing photos keep their current optimizer output.
 */
export function FillImage({ image, sizes, className, priority = false, quality }: FillImageProps) {
  if (image.srcSet) {
    return (
      // The srcset is the sized WebP set from the API. next/image would build a second set from one URL.
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={image.alt} className={classNames("absolute inset-0 size-full object-cover", className)} sizes={sizes} src={image.src} srcSet={image.srcSet} />
    );
  }

  return <Image alt={image.alt} className={classNames("object-cover", className)} fill priority={priority} quality={quality} sizes={sizes} src={image.src} />;
}
