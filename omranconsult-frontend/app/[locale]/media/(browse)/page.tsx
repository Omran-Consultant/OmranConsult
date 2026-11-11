import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { MediaPageContent } from "@/features/news/components/media-page-content";
import { getMediaPageData } from "@/features/news/services/get-media-page-data";
import { parseMediaFilters } from "@/features/news/services/news-view";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getStaticPageSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type MediaPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const seo = await getStaticPageSeo(locale, "media");
  return buildPageMetadata({ locale, path: "/media", ...seo });
}

export default async function MediaPage({ params, searchParams }: MediaPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getMediaPageData(locale, parseMediaFilters(await searchParams));

  return <MediaPageContent view={view} />;
}
