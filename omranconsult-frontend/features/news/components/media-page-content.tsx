import { useTranslations } from "next-intl";
import Image from "next/image";

import { Breadcrumb } from "@/core/ui/breadcrumb";
import { LinkButton } from "@/core/ui/button";
import { EmptyState } from "@/core/ui/empty-state";
import { Icon } from "@/core/ui/icon";
import { NewsCard } from "@/core/ui/news-card";
import { NewsletterForm } from "@/core/ui/newsletter-form";
import { MediaTabs } from "@/features/news/components/media-tabs";
import type { MediaView } from "@/features/news/services/get-media-page-data";
import { mediaQuery } from "@/features/news/services/news-view";
import { Link } from "@/i18n/navigation";

const PANEL_ID = "media-panel";

/**
 * Figma Media Center (§6.7): intro with breadcrumb and category tabs, the featured post («الكل»
 * only), the 3×2 grid with «تحميل المزيد», and the newsletter block. Below 1024 px the featured
 * post reads like a news card at the top of the list.
 */
export function MediaPageContent({ view }: { readonly view: MediaView }) {
  const t = useTranslations("MediaPage");
  const tLayout = useTranslations("Layout");
  const { copy, filters } = view;
  const title = copy.title ?? tLayout("nav.media");
  const tabs = [
    { id: "media-tab-all", label: t("allTab"), href: `/media${mediaQuery(filters, { category: undefined, page: 1 })}`, selected: !filters.category },
    ...view.categories.map((category) => ({
      id: `media-tab-${category.slug}`,
      label: category.name,
      href: `/media${mediaQuery(filters, { category: category.slug, page: 1 })}`,
      selected: filters.category === category.slug,
    })),
  ];
  const selectedTab = tabs.find((tab) => tab.selected) ?? tabs[0];
  const shown = view.cards.length + (view.featured ? 1 : 0);
  const total = view.total + (view.featured ? 1 : 0);

  return (
    <>
      <section aria-labelledby="media-title" className="pt-6 pb-6 lg:pt-20 lg:pb-12" data-section="intro">
        <div className="container-page flex flex-col gap-4.5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="flex flex-col gap-4.5 md:gap-4">
            <Breadcrumb items={[{ label: tLayout("nav.home"), href: "/" }, { label: tLayout("nav.media") }]} label={tLayout("breadcrumbLabel")} />
            <h1 className="font-display text-display-l text-primary" id="media-title">
              {title}
            </h1>
            {copy.intro ? <p className="max-w-120 text-body-l text-secondary max-md:hidden">{copy.intro}</p> : null}
          </div>
          <MediaTabs label={t("tablistLabel")} panelId={PANEL_ID} tabs={tabs} />
        </div>
      </section>

      <div aria-labelledby={selectedTab.id} data-section="list" id={PANEL_ID} role="tabpanel">
        {view.featured ? <FeaturedPost post={view.featured} /> : null}

        <section aria-labelledby="media-list-title" className="pb-12 lg:pb-25" data-section="grid">
          <div className="container-page flex flex-col gap-4 lg:gap-6">
            <h2 className="sr-only" id="media-list-title">
              {t("listTitle")}
            </h2>
            <p aria-live="polite" className="sr-only">
              {t("count", { shown, total })}
            </p>
            {shown === 0 ? (
              <EmptyState
                action={
                  <LinkButton href="/media" variant="secondary">
                    {t("emptyAction")}
                  </LinkButton>
                }
                icon="inbox"
                title={t("emptyTitle")}
              />
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {view.cards.map((card) => (
                  <li className="flex" key={card.slug}>
                    <NewsCard
                      category={card.category}
                      className="w-full"
                      date={card.year}
                      dateTime={card.dateTime}
                      excerpt={card.excerpt}
                      href={card.href}
                      image={card.image}
                      linkLabel={t("readMore")}
                      title={card.title}
                    />
                  </li>
                ))}
              </ul>
            )}
            {view.hasMore ? (
              <div className="flex justify-center pt-0 lg:pt-6">
                <LinkButton arrow className="max-md:w-full" href={`/media${mediaQuery(filters, { page: filters.page + 1 })}`} scroll={false} variant="secondary">
                  {t("loadMore")}
                </LinkButton>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {copy.newsletter.title ? (
        <section aria-labelledby="media-newsletter-title" className="pb-12 lg:pb-30" data-section="newsletter-wrap">
          <div className="container-page">
            <div className="flex flex-col gap-6 rounded-[24px] border border-line bg-elevated px-5 py-8 md:rounded-[28px] md:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16 lg:py-14">
              <div className="flex flex-col gap-2">
                <h2 className="font-display text-h3 text-primary md:text-h2" id="media-newsletter-title">
                  {copy.newsletter.title}
                </h2>
                {copy.newsletter.text ? <p className="text-body-m text-secondary">{copy.newsletter.text}</p> : null}
              </div>
              <NewsletterForm className="w-full lg:max-w-120" variant="block" />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

type FeaturedPostProps = { readonly post: NonNullable<MediaView["featured"]> };

/** Figma "Featured Card": 700-px photo and a 48-px padded body; the badge and button show from 1024 px. */
function FeaturedPost({ post }: FeaturedPostProps) {
  const t = useTranslations("MediaPage");
  const meta = [post.monthYear, post.readingMinutes ? t("readingTime", { minutes: post.readingMinutes }) : undefined].filter(Boolean).join(" · ");

  return (
    <section aria-labelledby="media-featured-title" className="pb-4 lg:pb-16" data-section="featured">
      <div className="container-page">
        <article className="group relative grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[700fr_578fr] lg:rounded-[28px]">
          <div className="relative h-60 overflow-hidden bg-highlight lg:h-auto lg:min-h-115">
            <Image
              alt={post.image.alt}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              fill
              priority
              sizes="(min-width: 1024px) 700px, (min-width: 768px) 100vw, 350px"
              src={post.image.src}
            />
          </div>
          <div className="flex flex-col gap-3.5 px-6 py-5.5 lg:gap-5 lg:p-12">
            <span className="self-start rounded-full bg-accent-strong/18 px-3 py-1.5 text-caption text-accent max-lg:hidden">{t("featuredBadge")}</span>
            <p className="flex items-center gap-2.5 text-caption lg:hidden">
              {post.category ? <span className="text-accent">{post.category}</span> : null}
              {post.category && post.year ? <span aria-hidden="true" className="size-1 rounded-full bg-muted" /> : null}
              {post.year ? (
                <time className="text-muted" dateTime={post.dateTime}>
                  {post.year}
                </time>
              ) : null}
            </p>
            <h2 className="font-display text-h4 text-primary lg:text-h1" id="media-featured-title">
              {post.title}
            </h2>
            {post.excerpt ? <p className="line-clamp-3 text-body-s text-secondary lg:line-clamp-none lg:text-body-l">{post.excerpt}</p> : null}
            <div className="mt-auto flex flex-wrap items-center gap-6 max-lg:hidden">
              <LinkButton arrow href={post.href}>
                {t("readArticle")}
              </LinkButton>
              {meta ? <p className="text-caption text-muted">{meta}</p> : null}
            </div>
            <Link
              className="mt-auto inline-flex items-center gap-3 self-start py-1.5 text-label-m text-accent transition-colors duration-150 after:absolute after:inset-0 hover:text-primary lg:hidden"
              href={post.href}
            >
              <span>{t("readMore")}</span>
              <Icon className="text-accent" name="arrow" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
