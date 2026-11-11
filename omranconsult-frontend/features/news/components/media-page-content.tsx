import { useLocale, useTranslations } from "next-intl";

import { buildBreadcrumbJsonLd } from "@/core/seo/breadcrumbs";
import { JsonLd } from "@/core/seo/json-ld";
import { Breadcrumb } from "@/core/ui/breadcrumb";
import { LinkButton } from "@/core/ui/button";
import { EmptyState } from "@/core/ui/empty-state";
import { NewsCard } from "@/core/ui/news-card";
import { NewsletterForm } from "@/core/ui/newsletter-form";
import { MediaTabs } from "@/features/news/components/media-tabs";
import type { MediaView } from "@/features/news/services/get-media-page-data";
import { mediaQuery } from "@/features/news/services/news-view";
import type { AppLocale } from "@/i18n/routing";

const PANEL_ID = "media-panel";

/**
 * Figma Media Center (§6.7): intro with breadcrumb and category tabs, the featured post («الكل»
 * only), the 3×2 grid with «تحميل المزيد», and the newsletter block. Below 1024 px the featured
 * post reads like a news card at the top of the list.
 */
export function MediaPageContent({ view }: { readonly view: MediaView }) {
  const t = useTranslations("MediaPage");
  const tLayout = useTranslations("Layout");
  const locale = useLocale() as AppLocale;
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
      <JsonLd data={buildBreadcrumbJsonLd(locale, [{ name: tLayout("nav.home"), path: "" }, { name: tLayout("nav.media"), path: "/media" }])} />
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
        {view.featured ? (
          <section aria-labelledby="media-featured-title" className="pb-4 lg:pb-16" data-section="featured">
            <div className="container-page">
              <NewsCard
                category={view.featured.category}
                date={view.featured.monthYear}
                dateTime={view.featured.dateTime}
                emphasis="featured"
                excerpt={view.featured.excerpt}
                href={view.featured.href}
                image={view.featured.image}
                priority
                readTime={
                  view.featured.readingMinutes ? t("readingTime", { minutes: view.featured.readingMinutes }) : undefined
                }
                title={view.featured.title}
                titleId="media-featured-title"
              />
            </div>
          </section>
        ) : null}

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
                  <li className="flex h-full min-w-0" key={card.slug}>
                    <NewsCard
                      category={card.category}
                      className="w-full"
                      date={card.year}
                      dateTime={card.dateTime}
                      href={card.href}
                      image={card.image}
                      readTime={card.readingMinutes ? t("readingTime", { minutes: card.readingMinutes }) : undefined}
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
