import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AboutPageContent } from "@/features/about/components/about-page-content";
import { getAboutPageData } from "@/features/about/services/get-about-page-data";
import { routing } from "@/i18n/routing";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const data = await getAboutPageData(locale);

  return <AboutPageContent data={data} locale={locale} />;
}
