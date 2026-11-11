import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { HomeApiFault } from "@/features/home/components/home-api-fault";
import { HomePageContent } from "@/features/home/components/home-page-content";
import { getHomePageData } from "@/features/home/services/get-home-page-data";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getSiteSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  return buildPageMetadata({ locale, path: "", ...(await getSiteSeo(locale)) });
}

export default async function PublicHomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getHomePageData(locale);

  return (
    <>
      <HomeApiFault />
      <HomePageContent view={view} />
    </>
  );
}
