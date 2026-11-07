import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { FOOTER_QUICK_LINKS } from "@/features/layout/navigation";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TwitterIcon,
} from "@/features/layout/components/site-icons";

const footerLinkClassName =
  "text-muted-on-dark transition-colors hover:text-brand-green-light";

export async function SiteFooter() {
  const t = await getTranslations("Layout.footer");
  const brandT = await getTranslations("Layout.brand");
  const navT = await getTranslations("Layout.nav");
  const socialT = await getTranslations("Layout.social");

  const socialLinks = [
    { label: socialT("facebook"), Icon: FacebookIcon },
    { label: socialT("twitter"), Icon: TwitterIcon },
    { label: socialT("linkedin"), Icon: LinkedInIcon },
    { label: socialT("instagram"), Icon: InstagramIcon },
  ] as const;

  const phones = [
    { tel: t("phoneTel"), display: t("phoneDisplay") },
    { tel: t("phoneSecondaryTel"), display: t("phoneSecondaryDisplay") },
  ] as const;

  return (
    <footer className="bg-footer text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Link className="block" href="/">
                <BrandLogo
                  alt={brandT("logoAlt")}
                  className="h-12 w-auto sm:h-14"
                  surface="onDark"
                />
              </Link>
            </div>
            <p className="mb-4 text-muted-on-dark">{t("tagline")}</p>
            <div className="flex gap-4">
              {socialLinks.map(({ label, Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="rounded-full bg-white/10 p-1.5 transition-all hover:bg-white/20"
                  href="#"
                  rel="noopener noreferrer"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("quickLinks")}</h3>
            <ul className="space-y-2">
              {FOOTER_QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link className={footerLinkClassName} href={item.href}>
                    {navT(item.messageKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("contactHeading")}</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-muted-on-dark">
                <MapPinIcon className="mt-1 size-5 shrink-0 text-brand-green-light" />
                <span>{t("address")}</span>
              </div>
              {phones.map((phone) => (
                <div className="flex items-center gap-3 text-muted-on-dark" key={phone.tel}>
                  <PhoneIcon className="size-5 shrink-0 text-brand-green-light" />
                  <a
                    className="hover:text-brand-green-light"
                    dir="ltr"
                    href={`tel:${phone.tel}`}
                  >
                    {phone.display}
                  </a>
                </div>
              ))}
              <div className="flex items-center gap-3 text-muted-on-dark">
                <MailIcon className="size-5 shrink-0 text-brand-green-light" />
                <a className="hover:text-brand-green-light" href={`mailto:${t("email")}`}>
                  {t("email")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center">
          <p className="text-muted-on-dark-subtle">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
