import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { LinkButton } from "@/core/ui/button";
import { Container } from "@/core/ui/container";
import { Overline } from "@/core/ui/overline";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";
import { LCP_IMAGE } from "@/core/ui/fill-image";

/** 404 in the hero style (not designed; PHASE4C §6.8): photo, scrim, Display/L title, home button. */
export async function NotFoundHero({ locale }: { readonly locale: AppLocale }) {
  const t = await getTranslations("Layout");
  const image = toImageAsset(SITE_IMAGES.earth2, locale);

  return (
    <main className="scheme-dark relative isolate flex min-h-[calc(100svh-78px)] flex-1 items-center overflow-hidden bg-canvas py-24 text-primary lg:min-h-[calc(100svh-116px)]">
      <Image alt="" className="-z-20 object-cover opacity-60" fill {...LCP_IMAGE} sizes="100vw" src={image.src} />
      <span aria-hidden="true" className="scrim-start absolute inset-0 -z-10" />
      <Container className="flex flex-col items-start gap-6">
        <Overline>404</Overline>
        <h1 className="max-w-190 font-display text-display-l">{t("notFound.title")}</h1>
        <p className="max-w-155 text-body-l text-secondary">{t("notFound.text")}</p>
        <LinkButton arrow href="/">
          {t("notFound.home")}
        </LinkButton>
      </Container>
    </main>
  );
}
