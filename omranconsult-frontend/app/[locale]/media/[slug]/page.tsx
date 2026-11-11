import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { NewsArticleContent } from "@/features/news/components/news-article-content";
import { getNewsArticleData } from "@/features/news/services/get-news-article-data";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getSiteSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type NewsArticlePageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const [site, article] = await Promise.all([getSiteSeo(locale), getNewsArticleData(locale, slug)]);
  if (!article) {
    return {};
  }
  const lead = article.body.find((block) => block.type === "paragraph");
  const image = article.ogImage ?? article.cover;
  return buildPageMetadata({
    locale,
    path: `/media/${encodeURIComponent(slug)}`,
    siteName: site.siteName,
    title: article.seoTitle ?? article.title,
    description: article.seoDescription ?? article.excerpt ?? (lead && "text" in lead ? lead.text : article.title),
    image: { url: image.src, alt: image.alt, width: image.width, height: image.height },
    type: "article",
    publishedTime: article.dateTime,
  });
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
