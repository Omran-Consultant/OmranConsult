import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AboutPageContent } from "@/features/about/components/about-page-content";
import { getAboutPageData } from "@/features/about/services/get-about-page-data";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getStaticPageSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const seo = await getStaticPageSeo(locale, "about");
  return buildPageMetadata({ locale, path: "/about", ...seo });
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
