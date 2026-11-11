import { formatMonthYear, formatYear } from "@/core/format/date";
import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { newsImage } from "@/features/news/services/get-media-page-data";
import { articleBlocks, mediaCopySchema, readingMinutes } from "@/features/news/services/news-view";
import { mapNewsDetailToUiModel, mapPageToBlocks } from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicNewsPost, fetchPublicPage } from "@/lib/api/public-content";

/** GET /api/news/{slug} + the `media` design copy (sidebar CTA); null when the post is not public. */
export async function getNewsArticleData(locale: AppLocale, slug: string) {
  const [payload, page] = await Promise.all([fetchPublicNewsPost(locale, slug), fetchPublicPage(locale, "media")]);
  if (!payload) {
    return null;
  }
  const post = mapNewsDetailToUiModel(payload);
  if (!post.title) {
    return null;
  }
  const blocks = articleBlocks(post.body);
  const origin = getConfiguredPublicSiteOrigin();

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    monthYear: formatMonthYear(post.date, locale),
    dateTime: post.date,
    readingMinutes: readingMinutes(blocks),
    author: post.author,
    tags: post.tags,
    cover: newsImage(post.imageKey, locale, {
      url: post.imageUrl,
      srcSet: post.imageSrcSet,
      width: post.imageWidth,
      height: post.imageHeight,
      alt: post.imageAlt,
    }),
    body: blocks.map((block) => {
      if (block.type !== "image") {
        return block;
      }
      const isUrl = block.image.startsWith("/") || block.image.startsWith("http");
      return {
        type: "image" as const,
        image: newsImage(isUrl ? undefined : block.image, locale, isUrl ? { url: block.image } : undefined),
      };
    }),
    related: post.related
      .filter((item) => item.title)
      .map((item) => ({
        slug: item.slug,
        href: `/media/${item.slug}`,
        title: item.title ?? "",
        year: formatYear(item.date),
        dateTime: item.date,
        image: newsImage(item.imageKey, locale, {
          url: item.imageUrl,
          srcSet: item.imageSrcSet,
          width: item.imageWidth,
          height: item.imageHeight,
          alt: item.imageAlt,
        }),
      })),
    cta: mediaCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}).article_cta,
    ctaImage: toImageAsset(SITE_IMAGES.night, locale),
    shareUrl: origin ? `${origin}/${locale}/media/${post.slug}` : undefined,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    ogImage: post.ogImage,
  };
}

export type NewsArticleView = NonNullable<Awaited<ReturnType<typeof getNewsArticleData>>>;
