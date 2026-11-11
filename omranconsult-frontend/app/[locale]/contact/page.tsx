import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ContactPageContent } from "@/features/contact/components/contact-page-content";
import { getContactPageData } from "@/features/contact/services/get-contact-page-data";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getStaticPageSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const seo = await getStaticPageSeo(locale, "contact");
  return buildPageMetadata({ locale, path: "/contact", ...seo });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getContactPageData(locale);

  return <ContactPageContent view={view} />;
}
