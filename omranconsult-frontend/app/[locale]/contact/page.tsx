import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ContactPageContent } from "@/features/contact/components/contact-page-content";
import { getContactPageData } from "@/features/contact/services/get-contact-page-data";
import { routing } from "@/i18n/routing";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getContactPageData(locale);

  return <ContactPageContent view={view} />;
}
