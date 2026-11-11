import { useTranslations } from "next-intl";
import Image from "next/image";
import { Fragment } from "react";

import { Breadcrumb } from "@/core/ui/breadcrumb";
import { LinkButton } from "@/core/ui/button";
import type { ImageAsset } from "@/core/ui/image-asset";
import { InlineRuns } from "@/core/ui/inline-runs";
import { ShareLinks } from "@/features/news/components/share-links";
import type { NewsArticleView } from "@/features/news/services/get-news-article-data";
import { Link } from "@/i18n/navigation";

type BodyBlock = NewsArticleView["body"][number];
type BodyGroup = { readonly kind: "text"; readonly block: Exclude<BodyBlock, { type: "image" }> } | { readonly kind: "images"; readonly images: ImageAsset[] };

/** Consecutive image blocks share one row (Figma: two 402 × 260 photos). */
function groupBody(blocks: readonly BodyBlock[]): BodyGroup[] {
  const groups: BodyGroup[] = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.type === "image") {
      if (last?.kind === "images") {
        last.images.push(block.image);
      } else {
        groups.push({ kind: "images", images: [block.image] });
      }
    } else {
      groups.push({ kind: "text", block });
    }
  }
  return groups;
}

/**
 * Figma News Article (§6.7): head (max width 1040), 620-px cover, the 820-px body and a 380-px
 * sidebar (related posts, CTA). The sidebar follows the article below 1024 px. Posts without a
 * body (Q9: posts 2–8) show their summary only.
 */
export function NewsArticleContent({ article }: { readonly article: NewsArticleView }) {
  const t = useTranslations("MediaPage");
  const tLayout = useTranslations("Layout");
  const groups = groupBody(article.body);
  const leadIndex = groups.findIndex((group) => group.kind === "text" && group.block.type === "paragraph");
  const meta = [article.monthYear, article.readingMinutes ? t("readingTime", { minutes: article.readingMinutes }) : undefined].filter(Boolean);

  return (
    <article aria-labelledby="article-title">
      <header className="pt-6 pb-8 lg:pt-20 lg:pb-12" data-section="article-head">
        <div className="container-page">
          <div className="mx-auto flex max-w-260 flex-col gap-5">
            <Breadcrumb
              items={[
                { label: tLayout("nav.home"), href: "/" },
                { label: tLayout("nav.media"), href: "/media" },
                { label: article.category?.name ?? article.title },
              ]}
              label={tLayout("breadcrumbLabel")}
            />
            <h1 className="font-display text-h1 text-primary md:text-display-l" id="article-title">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-muted">
              {article.author ? (
                <p className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="size-9 rounded-full bg-highlight" />
                  <span className="sr-only">{t("article.author")}: </span>
                  <span className="text-label-s text-primary">{article.author}</span>
                </p>
              ) : null}
              {meta.map((item, index) => (
                <Fragment key={item}>
                  {index > 0 || article.author ? <span aria-hidden="true" className="h-4 w-px bg-line-strong" /> : null}
                  {index === 0 && article.dateTime && article.monthYear ? <time dateTime={article.dateTime}>{item}</time> : <span>{item}</span>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div data-section="cover">
        <div className="container-page">
          <div className="relative aspect-350/220 overflow-hidden rounded-lg bg-highlight md:aspect-1280/620 md:rounded-[28px]">
            <Image alt={article.cover.alt} className="object-cover" fill priority sizes="(min-width: 1440px) 1280px, 100vw" src={article.cover.src} />
          </div>
        </div>
      </div>

      <div className="pt-8 pb-12 lg:pt-20 lg:pb-30" data-section="body">
        <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,820fr)_minmax(0,380fr)] lg:gap-20">
          <div className="flex min-w-0 flex-col gap-7 wrap-anywhere">
            {groups.length === 0 && article.excerpt ? <p className="font-display text-body-l font-medium text-primary lg:text-h3">{article.excerpt}</p> : null}
            {groups.map((group, index) => {
              if (group.kind === "images") {
                return (
                  <div className="grid gap-4 sm:grid-cols-2" key={`images-${index}`}>
                    {group.images.map((image, imageIndex) => (
                      <div className="relative aspect-402/260 overflow-hidden rounded-lg bg-highlight" key={`${image.src}-${imageIndex}`}>
                        <Image alt={image.alt} className="object-cover" fill sizes="(min-width: 1024px) 402px, (min-width: 640px) 50vw, 100vw" src={image.src} />
                      </div>
                    ))}
                  </div>
                );
              }
              const { block } = group;
              if (block.type === "heading") {
                const Heading = block.level;
                return (
                  <Heading className={block.level === "h2" ? "font-display text-h2 text-primary" : "font-display text-h3 text-primary"} key={index}>
                    <InlineRuns nodes={block.children} />
                  </Heading>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote className="rounded-lg bg-accent-strong/8 px-6 py-6 md:px-8 md:py-7" key={index}>
                    <p className="border-s-3 border-accent ps-6 font-display text-h4 text-primary md:text-h3">
                      <InlineRuns nodes={block.children} />
                    </p>
                  </blockquote>
                );
              }
              if (block.type === "list") {
                const List = block.style === "number" ? "ol" : "ul";
                return (
                  <List className={block.style === "number" ? "list-decimal ps-5 text-body-l text-secondary" : "list-disc ps-5 text-body-l text-secondary"} key={index}>
                    {block.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <InlineRuns nodes={item} />
                      </li>
                    ))}
                  </List>
                );
              }
              return (
                <p className={index === leadIndex ? "font-display text-body-l font-medium text-primary lg:text-h3" : "text-body-l text-secondary"} key={index}>
                  <InlineRuns nodes={block.children} />
                </p>
              );
            })}
            <div className="flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:flex-wrap md:items-center md:justify-between">
              {article.tags.length > 0 ? (
                <ul aria-label={t("article.tags")} className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <li className="rounded-full border border-line-strong px-3 py-1.5 text-caption text-secondary" key={tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
              <ShareLinks title={article.title} url={article.shareUrl} />
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            {article.related.length > 0 ? (
              <section aria-labelledby="article-related-title" className="flex flex-col gap-5">
                <h2 className="font-display text-h3 text-primary" id="article-related-title">
                  {t("article.related")}
                </h2>
                {/* Figma article sidebar (not a named card in DESIGN_BASELINE): 96 × 72 thumbnail, title, year. */}
                <ul className="flex flex-col gap-5">
                  {article.related.map((item) => (
                    <li className="border-b border-line pb-4.75" key={item.slug}>
                      <Link className="group flex items-start gap-3.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" href={item.href}>
                        <span className="relative h-18 w-24 shrink-0 overflow-hidden rounded-md bg-highlight">
                          <Image alt={item.image.alt} className="object-cover" fill sizes="96px" src={item.image.src} />
                        </span>
                        <span className="flex min-w-0 flex-col gap-1.5">
                          <span className="line-clamp-2 font-display text-body-m font-medium text-primary transition-colors group-hover:text-accent">{item.title}</span>
                          {item.year ? (
                            <time className="num-isolate self-start text-caption text-muted" dateTime={item.dateTime}>
                              {item.year}
                            </time>
                          ) : null}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {article.cta.title ? (
              <section aria-labelledby="article-cta-title" className="scheme-dark relative isolate flex flex-col items-start gap-3.5 overflow-hidden rounded-lg bg-canvas p-6 text-primary">
                <Image alt="" className="-z-20 object-cover" fill sizes="380px" src={article.ctaImage.src} />
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-canvas/75" />
                <h2 className="font-display text-h3 text-primary" id="article-cta-title">
                  {article.cta.title}
                </h2>
                {article.cta.text ? <p className="text-body-s text-secondary">{article.cta.text}</p> : null}
                <LinkButton arrow href="/contact">
                  {t("article.contact")}
                </LinkButton>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </article>
  );
}
