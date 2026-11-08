import { formatMonthYear, formatYear } from "@/core/format/date";
import { getSiteImage, SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";
import { articleBlocks, MAX_NEWS_PAGE, mediaCopySchema, NEWS_PAGE_SIZE, readingMinutes, type MediaFilters } from "@/features/news/services/news-view";
import {
  mapNewsCategoriesToUiModel,
  mapNewsDetailToUiModel,
  mapNewsIndexToUiModel,
  mapPageToBlocks,
} from "@/features/public-content/services/public-content-mappers";
import type { AppLocale } from "@/i18n/routing";
import { fetchPublicNews, fetchPublicNewsCategories, fetchPublicNewsPost, fetchPublicPage } from "@/lib/api/public-content";

type NewsPostModel = ReturnType<typeof mapNewsIndexToUiModel>["posts"][number];

export function newsImage(key: string | undefined, locale: AppLocale) {
  return toImageAsset(getSiteImage(key) ?? SITE_IMAGES.building, locale);
}

export function toNewsCard(post: NewsPostModel, locale: AppLocale) {
  return {
    slug: post.slug,
    href: `/media/${post.slug}`,
    title: post.title ?? "",
    excerpt: post.excerpt,
    category: post.category?.name,
    year: formatYear(post.date),
    dateTime: post.date,
    image: newsImage(post.imageKey, locale),
  };
}

export type NewsCardModel = ReturnType<typeof toNewsCard>;

/**
 * «الكل»: the featured post (`featured=1`) plus the other posts (`featured=0`); a category tab
 * lists every post in that category. The list is cumulative: page N shows N × 6 posts.
 */
export async function getMediaPageData(locale: AppLocale, filters: MediaFilters) {
  const all = !filters.category;
  const perPage = NEWS_PAGE_SIZE * filters.page;
  const [page, categoriesPayload, featuredPayload, listPayload] = await Promise.all([
    fetchPublicPage(locale, "media"),
    fetchPublicNewsCategories(locale),
    all ? fetchPublicNews(locale, { featured: true, perPage: 1 }) : Promise.resolve(undefined),
    fetchPublicNews(locale, all ? { featured: false, perPage } : { category: filters.category, perPage }),
  ]);

  const featuredPost = featuredPayload ? mapNewsIndexToUiModel(featuredPayload).posts.find((post) => post.title) : undefined;
  const featuredDetailPayload = featuredPost ? await fetchPublicNewsPost(locale, featuredPost.slug) : null;
  const featuredDetail = featuredDetailPayload ? mapNewsDetailToUiModel(featuredDetailPayload) : undefined;
  const list = mapNewsIndexToUiModel(listPayload);
  const cards = list.posts.filter((post) => post.title).map((post) => toNewsCard(post, locale));

  return {
    filters,
    copy: mediaCopySchema.parse(mapPageToBlocks(page).design_copy ?? {}),
    categories: mapNewsCategoriesToUiModel(categoriesPayload),
    featured: featuredPost
      ? {
          ...toNewsCard(featuredPost, locale),
          monthYear: formatMonthYear(featuredPost.date, locale),
          readingMinutes: featuredDetail ? readingMinutes(articleBlocks(featuredDetail.body)) : undefined,
        }
      : undefined,
    cards,
    total: list.total,
    hasMore: list.total > list.posts.length && filters.page < MAX_NEWS_PAGE,
  };
}

export type MediaView = Awaited<ReturnType<typeof getMediaPageData>>;
