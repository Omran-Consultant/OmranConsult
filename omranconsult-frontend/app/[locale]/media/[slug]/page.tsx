import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { NewsArticleContent } from "@/features/news/components/news-article-content";
import { getNewsArticleData } from "@/features/news/services/get-news-article-data";
import { routeAlternatesMetadata } from "@/core/seo/locale-metadata";
import { routing } from "@/i18n/routing";

type NewsArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  return routeAlternatesMetadata(locale, `/media/${encodeURIComponent(slug)}`);
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const article = await getNewsArticleData(locale, slug);

  if (!article) {
    notFound();
  }

  return <NewsArticleContent article={article} />;
}
