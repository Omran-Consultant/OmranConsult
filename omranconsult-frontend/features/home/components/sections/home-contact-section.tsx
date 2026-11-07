import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { LinkButton } from "@/core/ui/button";
import { formatPhoneForDisplay, formatPhoneTelLink } from "@/core/format/phone";
import { SECTION_BACKGROUND_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import type { HomePageData } from "@/features/home/types/home-page-data";
import type { AppLocale } from "@/i18n/routing";

type HomeContactSectionProps = {
  readonly locale: AppLocale;
  readonly settings: HomePageData["settings"];
};

export async function HomeContactSection({ locale, settings }: HomeContactSectionProps) {
  const t = await getTranslations("HomePage");
  const image = SECTION_BACKGROUND_IMAGES.contact;
  const contact = settings.contact;

  return (
    <section className="relative min-h-svh bg-canvas" data-section="contact" id="contact">
      <Image
        alt={getProfileImageAlt(image, locale)}
        className="absolute inset-0 h-full w-full object-cover"
        fill
        sizes="100vw"
        src={image.src}
      />
      <div className="relative z-1 flex justify-start px-page py-14">
        <div className="w-full max-w-md rounded-lg bg-canvas p-8 text-primary">
          <h2 className="font-display text-3xl font-bold text-primary">{t("contactHeading")}</h2>
          <dl className="mt-4 space-y-3 text-base">
            {contact.address ? (
              <div>
                <dt className="text-sm text-secondary">{t("addressLabel")}</dt>
                <dd className="font-medium">
                  {contact.address}
                  {contact.postal ? (
                    <>
                      <br />
                      <span dir="ltr">{contact.postal}</span>
                    </>
                  ) : null}
                </dd>
              </div>
            ) : null}
            {contact.email ? (
              <div>
                <dt className="text-sm text-secondary">{t("emailLabel")}</dt>
                <dd>
                  <a className="num-isolate hover:text-accent" dir="ltr" href={`mailto:${contact.email}`}>
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.phones.length > 0 ? (
              <div>
                <dt className="text-sm text-secondary">{t("phoneLabel")}</dt>
                <dd className="space-y-1">
                  {contact.phones.map((phone) => (
                    <a
                      className="num-isolate block hover:text-accent"
                      dir="ltr"
                      href={`tel:${formatPhoneTelLink(phone)}`}
                      key={phone}
                    >
                      {formatPhoneForDisplay(phone)}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
          {contact.email ? (
            <LinkButton
              className="mt-4 w-full rounded-full"
              href={`mailto:${contact.email}?subject=${encodeURIComponent(t("consultationSubject"))}`}
            >
              {t("contactCta")}
            </LinkButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
