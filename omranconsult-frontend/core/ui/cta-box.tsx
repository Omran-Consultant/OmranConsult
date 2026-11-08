import Image from "next/image";
import type { ReactNode } from "react";

import { AccentText } from "@/core/ui/accent-text";
import { classNames } from "@/core/ui/class-names";
import type { ImageAsset } from "@/core/ui/image-asset";

type CtaBoxProps = {
  readonly image: ImageAsset;
  readonly title: string;
  readonly text?: string;
  /** Shorter text below 768 px (the 390 frames). */
  readonly textShort?: string;
  readonly titleId?: string;
  /** Buttons (Primary first, then Light). */
  readonly actions: ReactNode;
  readonly className?: string;
};

/** Figma "CTA Box": radius xl, photo with a start-side scrim, Display/L title, body, buttons. */
export function CtaBox({ image, title, text, textShort, titleId, actions, className }: CtaBoxProps) {
  return (
    <div
      className={classNames(
        "scheme-dark relative isolate flex items-center overflow-hidden rounded-[24px] bg-canvas px-6 py-10 text-primary md:min-h-110 md:rounded-xl md:px-18 md:py-14",
        className,
      )}
    >
      <Image alt={image.alt} className="-z-20 object-cover" fill sizes="(min-width: 1440px) 1280px, 100vw" src={image.src} />
      <span aria-hidden="true" className="absolute inset-0 -z-10 bg-scrim md:hidden" />
      <span aria-hidden="true" className="scrim-start absolute inset-0 -z-10 max-md:hidden" />
      <div className="flex max-w-155 flex-col gap-5 md:gap-7">
        <h2 className="font-display text-h1 md:text-display-l" id={titleId}>
          <AccentText value={title} />
        </h2>
        {text ? <p className={classNames("text-body-l text-secondary", textShort && "max-md:hidden")}>{text}</p> : null}
        {textShort ? <p className="text-body-l text-secondary md:hidden">{textShort}</p> : null}
        <div className="flex flex-wrap gap-4">{actions}</div>
      </div>
    </div>
  );
}
