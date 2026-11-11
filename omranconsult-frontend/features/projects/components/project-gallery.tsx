"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";

import { classNames } from "@/core/ui/class-names";
import { FillImage } from "@/core/ui/fill-image";
import { Icon } from "@/core/ui/icon";
import type { ImageAsset } from "@/core/ui/image-asset";
import { showModalFrom } from "@/core/ui/show-modal";

const ROUND_BUTTON = "flex size-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-150 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * Figma "Gallery": one 800×440 image over two 392×280 images. Further images continue in pairs;
 * an image left alone in its row spans the row, so there is never an empty frame. Native
 * <dialog> gives the focus trap, Esc and focus return; arrow keys follow the reading direction.
 */
export function ProjectGallery({ images }: { readonly images: readonly ImageAsset[] }) {
  const t = useTranslations("ProjectsPage");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const current = active === null ? undefined : images[active];
  const hasPairRemainder = (images.length - 1) % 2 === 1;

  const step = (delta: number) => setActive((index) => (index === null ? index : (index + delta + images.length) % images.length));

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      step(1);
    } else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) {
      step(-1);
    }
  };

  return (
    <>
      <ul aria-label={t("galleryLabel")} className="grid gap-4 md:grid-cols-2" data-section-part="gallery">
        {images.map((image, index) => {
          const lead = index === 0;
          const wide = lead || (hasPairRemainder && index === images.length - 1);
          return (
            <li className={classNames("min-w-0", wide && "md:col-span-2")} key={image.src}>
              <button
                aria-haspopup="dialog"
                aria-label={image.alt || t("galleryOpen", { index: index + 1 })}
                className={classNames(
                  "group relative block h-55 w-full overflow-hidden rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  lead ? "md:h-110" : "md:h-70",
                )}
                onClick={(event) => {
                  setActive(index);
                  showModalFrom(dialogRef.current, event.currentTarget);
                }}
                type="button"
              >
                <FillImage
                  className="motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out motion-safe:md:group-hover:scale-[1.04]"
                  image={image}
                  sizes={wide ? "(min-width: 1024px) 800px, 100vw" : "(min-width: 1024px) 392px, (min-width: 768px) 50vw, 100vw"}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <dialog
        aria-label={t("galleryLabel")}
        className="m-0 size-full max-h-none max-w-none bg-navy-950/95 p-0 text-white scheme-dark backdrop:bg-navy-950/80"
        data-lightbox=""
        onClose={() => setActive(null)}
        onKeyDown={onKeyDown}
        ref={dialogRef}
      >
        {current ? (
          <div className="relative size-full">
            <div className="absolute inset-x-4 inset-y-20 md:inset-x-24">
              <FillImage fit="contain" image={current} key={current.src} sizes="100vw" />
            </div>
            <p aria-live="polite" className="num-isolate absolute start-6 top-7 text-label-m">
              {t("galleryCounter", { index: (active ?? 0) + 1, total: images.length })}
            </p>
            <button
              aria-label={t("galleryClose")}
              autoFocus
              className={classNames(ROUND_BUTTON, "absolute end-5 top-4")}
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <Icon name="close" />
            </button>
            {images.length > 1 ? (
              <>
                <button aria-label={t("galleryPrevious")} className={classNames(ROUND_BUTTON, "absolute start-5 top-1/2 -translate-y-1/2 max-md:top-auto max-md:bottom-4 max-md:translate-y-0")} onClick={() => step(-1)} type="button">
                  <Icon className="rtl:-scale-x-100" name="chevron-left" />
                </button>
                <button aria-label={t("galleryNext")} className={classNames(ROUND_BUTTON, "absolute end-5 top-1/2 -translate-y-1/2 max-md:top-auto max-md:bottom-4 max-md:translate-y-0")} onClick={() => step(1)} type="button">
                  <Icon className="rtl:-scale-x-100" name="chevron-right" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
