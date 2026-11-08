import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AboutPageContent } from "@/features/about/components/about-page-content";
import { getAboutPageData } from "@/features/about/services/get-about-page-data";
import { routeAlternatesMetadata } from "@/core/seo/locale-metadata";
import { routing } from "@/i18n/routing";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return routeAlternatesMetadata(locale, "/about");
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getAboutPageData(locale);

  return <AboutPageContent view={view} />;
}
