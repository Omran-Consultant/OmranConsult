"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/core/ui/button";
import { Container } from "@/core/ui/container";
import { Overline } from "@/core/ui/overline";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";
import { LCP_IMAGE } from "@/core/ui/fill-image";

type LocaleErrorProps = {
  readonly error: unknown;
  /** Re-fetches the segment. Next 16's reset() clears the boundary without loading again. */
  readonly retry: () => void;
};

/** Hero-style error. The message is localized and the thrown value is never shown. */
export default function LocaleError({ retry }: LocaleErrorProps) {
  const t = useTranslations("Layout");
  const locale = useLocale() as AppLocale;
  const image = toImageAsset(SITE_IMAGES.earth2, locale);

  return (
    <main className="scheme-dark relative isolate flex min-h-[calc(100svh-78px)] flex-1 items-center overflow-hidden bg-canvas py-24 text-primary lg:min-h-[calc(100svh-116px)]">
      <Image alt="" className="-z-20 object-cover opacity-60" fill {...LCP_IMAGE} sizes="100vw" src={image.src} />
      <span aria-hidden="true" className="scrim-start absolute inset-0 -z-10" />
      <Container className="flex flex-col items-start gap-6">
        <Overline>500</Overline>
        <h1 className="max-w-190 font-display text-display-l">{t("error.title")}</h1>
        <p className="max-w-155 text-body-l text-secondary">{t("error.text")}</p>
        <Button onClick={() => retry()} type="button">
          {t("error.retry")}
        </Button>
      </Container>
    </main>
  );
}
