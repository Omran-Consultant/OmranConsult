import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { HomePageContent } from "@/features/home/components/home-page-content";
import { getHomePageData } from "@/features/home/services/get-home-page-data";
import { routing } from "@/i18n/routing";
type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PublicHomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  await getTranslations("HomePage");
  const data = await getHomePageData(locale);

  return <HomePageContent data={data} locale={locale} />;
}
