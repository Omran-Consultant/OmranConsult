"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { blocksFromUnknown, hasVisibleText, type ContentBlock } from "@/core/content/blocks";
import { BlockEditor } from "@/features/dashboard/content/block-editor";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { MediaPicker } from "@/features/dashboard/projects/media-picker";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSelect, DashboardSwitch, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import type { AppLocale } from "@/i18n/routing";
import { adminDiscardNewsDraft, adminNewsPost, adminPatchNews, adminPublishNews } from "@/lib/api/admin-browser";
import type { AdminNewsDetail } from "@/lib/api/types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function localeBlocks(source: unknown, locale: "ar" | "en"): ContentBlock[] {
  const record = asRecord(source);
  const blocks = blocksFromUnknown(record ? record[locale] : source);
  return blocks.length > 0 ? blocks : [{ type: "paragraph", children: [{ text: "" }] }];
}

function draftOrLive<T>(draft: Record<string, unknown> | null, key: string, live: T): T {
  if (draft && key in draft) {
    return draft[key] as T;
  }
  return live;
}

export default function NewsEditorPage() {
  const t = useTranslations("Dashboard.news");
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [detail, setDetail] = useState<AdminNewsDetail | null>(null);
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [excerptAr, setExcerptAr] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyAr, setBodyAr] = useState<ContentBlock[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const [bodyEn, setBodyEn] = useState<ContentBlock[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<number | null>(null);
  const [coverKey, setCoverKey] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [featured, setFeatured] = useState(false);
  const [demo, setDemo] = useState(false);
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescriptionAr, setSeoDescriptionAr] = useState("");
  const [seoDescriptionEn, setSeoDescriptionEn] = useState("");
  const [picker, setPicker] = useState<"cover" | "body-ar" | "body-en" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyDetail(next: AdminNewsDetail) {
    setDetail(next);
    const draft = next.draft;
    const title = asRecord(draftOrLive(draft, "title", next.title));
    setTitleAr(typeof title?.ar === "string" ? title.ar : "");
    setTitleEn(typeof title?.en === "string" ? title.en : "");
    const excerpt = asRecord(draftOrLive(draft, "excerpt", next.excerpt));
    setExcerptAr(typeof excerpt?.ar === "string" ? excerpt.ar : "");
    setExcerptEn(typeof excerpt?.en === "string" ? excerpt.en : "");
    const body = draftOrLive(draft, "body", next.body);
    setBodyAr(localeBlocks(body, "ar"));
    setBodyEn(localeBlocks(body, "en"));
    setSlug(String(draftOrLive(draft, "slug", next.slug) ?? ""));
    const category = draftOrLive(draft, "news_category_id", next.news_category_id);
    setCategoryId(category ? String(category) : "");
    const mediaId = draftOrLive(draft, "cover_media_id", next.cover_media_id);
    setCoverMediaId(typeof mediaId === "number" ? mediaId : null);
    const coverImage = draftOrLive(draft, "cover_image", next.cover_image);
    setCoverKey(typeof coverImage === "string" ? coverImage : "");
    const published = draftOrLive(draft, "published_at", next.published_at);
    setPublishedAt(typeof published === "string" ? published.slice(0, 16) : "");
    setFeatured(Boolean(draftOrLive(draft, "is_featured", next.is_featured)));
    setDemo(Boolean(draftOrLive(draft, "is_demo", next.is_demo)));
    const seo = asRecord(draftOrLive(draft, "seo", next.seo));
    const seoTitle = asRecord(seo?.title);
    const seoDescription = asRecord(seo?.description);
    setSeoTitleAr(typeof seoTitle?.ar === "string" ? seoTitle.ar : "");
    setSeoTitleEn(typeof seoTitle?.en === "string" ? seoTitle.en : "");
    setSeoDescriptionAr(typeof seoDescription?.ar === "string" ? seoDescription.ar : "");
    setSeoDescriptionEn(typeof seoDescription?.en === "string" ? seoDescription.en : "");
  }

  useEffect(() => {
    void adminNewsPost(id).then(applyDetail).catch(() => setError(t("loadError")));
  }, [id, t]);

  const localBlockers = useMemo(() => {
    const codes: string[] = [];
    if (!titleAr.trim()) codes.push("title_ar");
    if (!titleEn.trim()) codes.push("title_en");
    if (!excerptAr.trim()) codes.push("excerpt_ar");
    if (!excerptEn.trim()) codes.push("excerpt_en");
    if (!hasVisibleText(bodyAr)) codes.push("body_ar");
    if (!hasVisibleText(bodyEn)) codes.push("body_en");
    if (!slug.trim()) codes.push("slug");
    if (!categoryId) codes.push("category");
    if (!coverMediaId && !coverKey) codes.push("cover");
    if (!publishedAt) codes.push("published_at");
    return codes;
  }, [titleAr, titleEn, excerptAr, excerptEn, bodyAr, bodyEn, slug, categoryId, coverMediaId, coverKey, publishedAt]);

  const blockerCodes = useMemo(() => {
    const fromServer = (detail?.publish_blockers ?? []).map((item) => item.code);
    return [...new Set([...localBlockers, ...fromServer])];
  }, [detail?.publish_blockers, localBlockers]);

  async function save() {
    try {
      const next = await adminPatchNews(id, {
        title: { ar: titleAr, en: titleEn },
        excerpt: { ar: excerptAr, en: excerptEn },
        body: { ar: bodyAr, en: bodyEn },
        slug,
        news_category_id: categoryId ? Number(categoryId) : null,
        cover_media_id: coverMediaId,
        cover_image: coverKey || null,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
        is_featured: featured,
        is_demo: demo,
        seo: {
          title: { ar: seoTitleAr, en: seoTitleEn },
          description: { ar: seoDescriptionAr, en: seoDescriptionEn },
        },
      });
      applyDetail(next);
      setMessage(t("saved"));
      setError(null);
      return next;
    } catch {
      setError(t("saveError"));
      return null;
    }
  }

  if (error && !detail) {
    return <p className="text-danger" data-ready="true">{error}</p>;
  }
  if (!detail) {
    return <p className="text-muted" data-ready="false">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={<StatusPill locale={locale} status={detail.has_unpublished_changes ? "published_with_draft" : detail.status} />}
        subtitle={t("subtitle")}
        title={titleAr || titleEn || t("edit")}
      />
      {detail.is_demo ? <p className="rounded-xl bg-highlight px-3 py-2 text-caption text-secondary">{t("demoWarning")}</p> : null}
      {message ? <p className="text-accent">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <DashboardTabs
              active={langTab}
              onChange={(tab) => setLangTab(tab as "ar" | "en")}
              tabs={[
                { id: "ar", label: t("localeAr") },
                { id: "en", label: t("localeEn") },
              ]}
            />
            <div className="mt-4 space-y-4">
              <div className={langTab === "ar" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-ar" label={t("titleLabel")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
                <DashboardTextField id="excerpt-ar" label={t("excerpt")} onChange={(event) => setExcerptAr(event.target.value)} value={excerptAr} />
                <div>
                  <p className="mb-2 text-label-s text-secondary">{t("body")}</p>
                  <BlockEditor allowImages blocks={bodyAr} fieldId="body-ar" onChange={setBodyAr} onPickImage={() => setPicker("body-ar")} />
                </div>
              </div>
              <div className={langTab === "en" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-en" label={t("titleLabel")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
                <DashboardTextField id="excerpt-en" label={t("excerpt")} onChange={(event) => setExcerptEn(event.target.value)} value={excerptEn} />
                <div>
                  <p className="mb-2 text-label-s text-secondary">{t("body")}</p>
                  <BlockEditor allowImages blocks={bodyEn} fieldId="body-en" onChange={setBodyEn} onPickImage={() => setPicker("body-en")} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("publishCard")}</h2>
            {blockerCodes.length > 0 ? (
              <ul className="mb-3 space-y-1 rounded-xl border border-danger/30 bg-danger/5 p-3 text-caption text-danger" data-publish-blockers>
                {blockerCodes.map((code) => (
                  <li key={code}>{t(`blocker.${code}` as "blocker.cover")}</li>
                ))}
              </ul>
            ) : null}
            <div className="space-y-3">
              <DashboardSelect id="category" label={t("category")} onChange={(event) => setCategoryId(event.target.value)} value={categoryId}>
                <option value="">{t("choose")}</option>
                {(detail.lookups?.categories ?? []).map((item) => (
                  <option key={item.id} value={item.id}>
                    {(locale === "ar" ? item.name?.ar : item.name?.en) || item.slug}
                  </option>
                ))}
              </DashboardSelect>
              <DashboardTextField dir="ltr" id="slug" label={t("slug")} onChange={(event) => setSlug(event.target.value)} spellCheck={false} value={slug} />
              <DashboardTextField id="published-at" label={t("publishedAt")} onChange={(event) => setPublishedAt(event.target.value)} type="datetime-local" value={publishedAt} />
              <DashboardSwitch checked={featured} id="featured" label={t("featured")} onChange={setFeatured} />
              <DashboardSwitch checked={demo} id="demo" label={t("demo")} onChange={setDemo} />
              <DashboardButton onClick={() => setPicker("cover")} type="button" variant="secondary">
                {t("pickCover")}
              </DashboardButton>
              {coverMediaId || coverKey ? (
                <p className="text-caption text-muted" dir="ltr">
                  {coverKey || `media #${coverMediaId}`}
                </p>
              ) : null}
              <DashboardButton onClick={() => void save()} type="button" variant="secondary">
                {t("save")}
              </DashboardButton>
              {detail.has_unpublished_changes ? (
                <DashboardButton onClick={() => void adminDiscardNewsDraft(id).then(applyDetail)} type="button" variant="ghost">
                  {t("discard")}
                </DashboardButton>
              ) : null}
              <DashboardButton
                className={blockerCodes.length > 0 ? "opacity-50 grayscale" : undefined}
                disabled={blockerCodes.length > 0 || detail.status === "trashed"}
                disabledReason={blockerCodes.length > 0 ? t("publishBlocked") : undefined}
                onClick={() => void save().then((saved) => (saved ? adminPublishNews(id).then(applyDetail) : null))}
                type="button"
              >
                {t("publish")}
              </DashboardButton>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("seoCard")}</h2>
            <div className="space-y-3">
              <DashboardTextField
                id={`seo-title-${langTab}`}
                label={t("seoTitle")}
                onChange={(event) => (langTab === "ar" ? setSeoTitleAr(event.target.value) : setSeoTitleEn(event.target.value))}
                value={langTab === "ar" ? seoTitleAr : seoTitleEn}
              />
              <DashboardTextField
                id={`seo-description-${langTab}`}
                label={t("seoDescription")}
                onChange={(event) => (langTab === "ar" ? setSeoDescriptionAr(event.target.value) : setSeoDescriptionEn(event.target.value))}
                value={langTab === "ar" ? seoDescriptionAr : seoDescriptionEn}
              />
              <div className="rounded-xl border border-line bg-base p-3">
                <p className="text-label-s text-accent">{(langTab === "ar" ? seoTitleAr || titleAr : seoTitleEn || titleEn) || t("seoTitleFallback")}</p>
                <p className="truncate text-start text-caption text-muted" dir="ltr">{`/${langTab}/media/${slug}`}</p>
                <p className="text-caption text-secondary">{(langTab === "ar" ? seoDescriptionAr : seoDescriptionEn) || t("seoDescriptionFallback")}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <MediaPicker
        onClose={() => setPicker(null)}
        onSelect={(media) => {
          if (picker === "cover") {
            setCoverMediaId(media.id);
            setCoverKey("");
            return;
          }
          if (picker === "body-ar") {
            setBodyAr((current) => [...current, { type: "image", media_id: media.id, alt: { ar: "", en: "" }, url: media.url }]);
            return;
          }
          if (picker === "body-en") {
            setBodyEn((current) => [...current, { type: "image", media_id: media.id, alt: { ar: "", en: "" }, url: media.url }]);
          }
        }}
        open={picker !== null}
      />
    </div>
  );
}
