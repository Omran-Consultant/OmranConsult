import { getLocale, getTranslations } from "next-intl/server";

import { getCurrentYear } from "@/core/format/current-year";
import { formatPhoneForDisplay, formatPhoneTelLink } from "@/core/format/phone";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { NewsletterForm } from "@/core/ui/newsletter-form";
import { FOOTER_COLUMNS, FOOTER_COLUMNS_COMPACT } from "@/features/layout/navigation";
import { getLayoutData } from "@/features/layout/services/get-layout-data";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const headingClass = "text-label-m text-primary";
const linkClass = "text-body-s text-muted transition-colors duration-150 hover:text-primary";

type ColumnProps = {
  readonly title: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
  readonly className?: string;
};

function FooterColumn({ title, links, className }: ColumnProps) {
  return (
    <div className={className}>
      <h2 className={headingClass}>{title}</h2>
      <ul className="mt-4 flex flex-col gap-4 text-body-s max-md:mt-3 max-md:gap-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link className={linkClass} href={link.href}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Figma "Footer": brand, Company, Services, Contact and Newsletter columns, the giant "OMRAN"
 * wordmark, and the bottom bar. Mobile follows the 390 frame: brand, two columns, copyright.
 */
export async function SiteFooter() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("Layout");
  const data = await getLayoutData(locale);
  const footerLinks = (column: readonly { href: string; messageKey: string }[]) =>
    column.map((item) => ({ href: item.href, label: t(`footer.${item.messageKey}`) }));
  const year = await getCurrentYear();
  const copyright = t("footer.copyright", { year, name: data.companyName ?? "" });
  const copyrightShort = t("footer.copyrightShort", { year, name: data.companyName ?? "" });

  return (
    <footer aria-label={t("footer.label")} className="bg-surface pt-12 pb-10 md:pt-25" data-section="footer">
      <div className="container-page">
        <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:gap-12 lg:grid-cols-[340fr_149fr_149fr_149fr_300fr]">
          <div className="col-span-2 flex flex-col gap-6 lg:col-span-1">
            <Link className="self-start" href="/">
              <BrandLogo alt={t("brand.logoAlt")} className="h-auto w-37.5 md:w-45" surface="adaptive" />
            </Link>
            {data.footerAbout ? <p className="hidden max-w-85 text-body-s text-secondary md:block">{data.footerAbout}</p> : null}
          </div>

          <FooterColumn className="hidden md:block" links={footerLinks(FOOTER_COLUMNS.company)} title={t("footer.companyHeading")} />
          <FooterColumn className="hidden md:block" links={footerLinks(FOOTER_COLUMNS.services)} title={t("footer.servicesHeading")} />
          <FooterColumn className="md:hidden" links={footerLinks(FOOTER_COLUMNS_COMPACT.company)} title={t("footer.companyHeading")} />
          <FooterColumn className="md:hidden" links={footerLinks(FOOTER_COLUMNS_COMPACT.services)} title={t("footer.servicesHeading")} />

          <div className="hidden md:block">
            <h2 className={headingClass}>{t("footer.contactHeading")}</h2>
            <ul className="mt-4 flex flex-col gap-4 text-body-s text-muted">
              {data.address ? <li>{data.address}</li> : null}
              {data.phones.map((phone) => (
                <li key={phone}>
                  <a className="num-isolate transition-colors duration-150 hover:text-primary" dir="ltr" href={`tel:${formatPhoneTelLink(phone)}`}>
                    {formatPhoneForDisplay(phone)}
                  </a>
                </li>
              ))}
              {data.email ? (
                <li>
                  <a className="transition-colors duration-150 hover:text-primary" dir="ltr" href={`mailto:${data.email}`}>
                    {data.email}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="hidden md:block">
            <h2 className={headingClass}>{t("footer.newsletterHeading")}</h2>
            {data.newsletterText ? <p className="mt-4 text-body-s text-muted">{data.newsletterText}</p> : null}
            <NewsletterForm className="mt-4" />
          </div>
        </div>

        <p
          aria-hidden="true"
          className="mt-16 hidden bg-linear-to-b from-tint to-transparent bg-clip-text text-center font-latin text-[min(18.75rem,21vw)] leading-[0.9] font-bold tracking-tight text-transparent select-none md:block"
          dir="ltr"
        >
          OMRAN
        </p>

        <div className="mt-7 flex flex-col gap-2 border-t border-line pt-5 text-caption text-muted md:mt-16 md:flex-row md:items-center md:justify-between md:pt-6">
          <p className="md:hidden">{copyrightShort}</p>
          <p className="max-md:hidden">{copyright}</p>
          {data.tagline ? <p className="hidden md:block">{data.tagline}</p> : null}
        </div>
      </div>
    </footer>
  );
}
