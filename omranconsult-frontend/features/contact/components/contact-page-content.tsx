import { useTranslations } from "next-intl";
import Image from "next/image";
import { Fragment, type ReactNode } from "react";

import { formatPhoneForDisplay, formatPhoneTelLink } from "@/core/format/phone";
import { Icon, type IconName } from "@/core/ui/icon";
import { SectionHeader } from "@/core/ui/section-header";
import { ContactForm } from "@/features/contact/components/contact-form";
import type { ContactView } from "@/features/contact/services/get-contact-page-data";

const linkClass = "transition-colors duration-150 hover:text-accent";

/**
 * Figma Contact (§6.6): no photo hero; info column (header, channel cards, aerial photo) at the
 * start and the form card at the end. Below 1024 px: intro and channels, form, then the photo.
 */
export function ContactPageContent({ view }: { readonly view: ContactView }) {
  const t = useTranslations("ContactPage");
  const { copy, contact } = view;
  const address = [contact.address, contact.postal].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="contact-title" className="pt-6 pb-12 md:py-16 lg:py-25" data-section="contact">
      <div className="container-page grid gap-6 lg:grid-cols-2 lg:gap-x-20 lg:gap-y-10">
        <div className="flex flex-col gap-4.5 lg:col-start-1 lg:row-start-1 lg:gap-10">
          {copy.title ? (
            <SectionHeader
              as="h1"
              className="gap-4.5 md:gap-5"
              overline={copy.overline}
              subtitle={copy.intro}
              subtitleShort={copy.intro_short}
              title={copy.title}
              titleClassName="max-md:text-display-l"
              titleId="contact-title"
            />
          ) : null}
          <ul aria-label={t("channelsLabel")} className="flex flex-col gap-3 md:gap-4">
            {address ? (
              <Channel icon="map-pin" label={t("addressLabel")}>
                {address}
              </Channel>
            ) : null}
            {contact.phones.length > 0 ? (
              <Channel icon="phone" label={t("phoneLabel")}>
                {contact.phones.map((phone, index) => (
                  <Fragment key={phone}>
                    {index > 0 ? <span aria-hidden="true"> · </span> : null}
                    <a className={`num-isolate ${linkClass}`} dir="ltr" href={`tel:${formatPhoneTelLink(phone)}`}>
                      {formatPhoneForDisplay(phone)}
                    </a>
                  </Fragment>
                ))}
              </Channel>
            ) : null}
            {contact.email ? (
              <Channel icon="mail" label={t("emailLabel")}>
                <a className={linkClass} dir="ltr" href={`mailto:${contact.email}`}>
                  {contact.email}
                </a>
              </Channel>
            ) : null}
            {contact.workingHours ? (
              <Channel icon="clock" label={t("hoursLabel")}>
                {contact.workingHours}
              </Channel>
            ) : null}
          </ul>
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <ContactForm serviceOptions={view.serviceOptions} title={copy.form_title} />
        </div>

        <div className="relative aspect-350/200 overflow-hidden rounded-lg max-lg:mt-6 md:aspect-600/260 lg:col-start-1 lg:row-start-2">
          <Image alt={view.image.alt} className="object-cover" fill sizes="(min-width: 1024px) 600px, 100vw" src={view.image.src} />
        </div>
      </div>
    </section>
  );
}

type ChannelProps = {
  readonly icon: IconName;
  readonly label: string;
  readonly children: ReactNode;
};

/** Figma "Channel": 48 px tinted icon box, caption label, value. The 390 cards have no icon. */
function Channel({ icon, label, children }: ChannelProps) {
  return (
    <li className="flex items-center gap-5 rounded-[18px] border border-line bg-surface px-4.5 py-4 md:bg-glass md:px-6 md:py-5">
      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-accent-strong/16 text-accent max-md:hidden">
        <Icon name={icon} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-caption text-muted">{label}</span>
        <span className="text-label-m text-primary md:font-display md:text-h4">{children}</span>
      </div>
    </li>
  );
}
