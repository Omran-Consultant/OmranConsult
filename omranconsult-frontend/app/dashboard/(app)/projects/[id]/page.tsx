"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { blocksFromUnknown, hasVisibleText, type ContentBlock } from "@/core/content/blocks";
import { Icon } from "@/core/ui/icon";
import { BlockEditor } from "@/features/dashboard/content/block-editor";
import { formatFullDateTime } from "@/features/dashboard/format/relative-time";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { GalleryEditor, type GalleryDraftItem } from "@/features/dashboard/projects/gallery-editor";
import { readLocalizedField, readLocalizedFieldPreferringLive } from "@/features/dashboard/projects/localized-field";
import { MediaPicker } from "@/features/dashboard/projects/media-picker";
import { ConfirmDialog } from "@/features/dashboard/ui/confirm-dialog";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSelect, DashboardSwitch, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import { DashboardMultiSelect } from "@/features/dashboard/ui/multi-select";
import type { AppLocale } from "@/i18n/routing";
import {
  adminDeleteProject,
  adminDiscardProjectDraft,
  adminPatchProject,
  adminProject,
  adminProjectPreviewToken,
  adminPublishProject,
  adminRestoreProject,
} from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";
import type { AdminGalleryItem, AdminLookup, AdminProjectDetail, AdminPublishBlocker } from "@/lib/api/types";

const BLOCKER_KEYS: Record<string, string> = {
  title_ar_required: "blockerTitleAr",
  title_en_required: "blockerTitleEn",
  overview_ar_required: "blockerOverviewAr",
  overview_en_required: "blockerOverviewEn",
  slug_required: "blockerSlug",
  client_required: "blockerClient",
  sector_required: "blockerSector",
  cover_required: "blockerCover",
  cover_alt_required: "blockerCoverAlt",
  dispute_blocks_publish: "blockerDispute",
};

const BLOCKER_FOCUS: Record<string, { id: string; lang?: "ar" | "en" }> = {
  title_ar_required: { id: "title-ar", lang: "ar" },
  title_en_required: { id: "title-en", lang: "en" },
  overview_ar_required: { id: "overview-ar", lang: "ar" },
  overview_en_required: { id: "overview-en", lang: "en" },
  slug_required: { id: "slug" },
  client_required: { id: "client" },
  sector_required: { id: "sector" },
  cover_required: { id: "gallery" },
  cover_alt_required: { id: "gallery" },
};

let gallerySequence = 0;

function nextGalleryId(): string {
  gallerySequence += 1;
  return `gallery-${gallerySequence}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function localeBlocks(source: unknown, locale: "ar" | "en"): ContentBlock[] {
  const record = asRecord(source);
  const blocks = blocksFromUnknown(record ? record[locale] : source);
  return blocks.length > 0 ? blocks : [{ type: "paragraph", children: [{ text: "" }] }];
}

function stringList(source: unknown, locale: "ar" | "en"): string[] {
  const record = asRecord(source);
  const list = record?.[locale];
  return Array.isArray(list) ? list.filter((item): item is string => typeof item === "string") : [];
}

function galleryDraft(items: AdminGalleryItem[] | null | undefined): GalleryDraftItem[] {
  return (items ?? []).map((item) => ({
    clientId: nextGalleryId(),
    key: item.key,
    media_id: item.media_id,
    url: item.url,
    alt: { ar: item.alt?.ar ?? "", en: item.alt?.en ?? "" },
  }));
}

function lookupLabel(item: AdminLookup, locale: AppLocale): string {
  const name = item.name;
  if (!name) {
    return item.slug;
  }
  return (locale === "ar" ? name.ar : name.en) || name.ar || name.en || item.slug;
}

export default function ProjectEditorPage() {
  const t = useTranslations("Dashboard.projects");
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [overviewAr, setOverviewAr] = useState<ContentBlock[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const [overviewEn, setOverviewEn] = useState<ContentBlock[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  const [slug, setSlug] = useState("");
  const [clientId, setClientId] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [regionIds, setRegionIds] = useState<number[]>([]);
  const [locationAr, setLocationAr] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [serviceAr, setServiceAr] = useState("");
  const [serviceEn, setServiceEn] = useState("");
  const [year, setYear] = useState("");
  const [delivery, setDelivery] = useState("");
  const [scopeAr, setScopeAr] = useState<string[]>([]);
  const [scopeEn, setScopeEn] = useState<string[]>([]);
  const [gallery, setGallery] = useState<GalleryDraftItem[]>([]);
  const [featured, setFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [seoTitleAr, setSeoTitleAr] = useState("");
  const [seoTitleEn, setSeoTitleEn] = useState("");
  const [seoDescriptionAr, setSeoDescriptionAr] = useState("");
  const [seoDescriptionEn, setSeoDescriptionEn] = useState("");
  const [ogImageId, setOgImageId] = useState<number | null>(null);
  const [picker, setPicker] = useState<"gallery" | "og" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  function applyDetail(detail: AdminProjectDetail) {
    const draft = detail.draft ?? {};
    setProject(detail);
    setTitleAr(readLocalizedFieldPreferringLive(draft.title, detail.title, "ar"));
    setTitleEn(readLocalizedFieldPreferringLive(draft.title, detail.title, "en"));
    const overviewSource = "overview" in draft ? draft.overview : detail.overview;
    setOverviewAr(localeBlocks(overviewSource, "ar"));
    setOverviewEn(localeBlocks(overviewSource, "en"));
    setSlug(typeof draft.slug === "string" ? draft.slug : detail.slug);
    setClientId(String((draft.client_id as number | null | undefined) ?? detail.client_id ?? ""));
    setSectorId(String((draft.sector_id as number | null | undefined) ?? detail.sector_id ?? ""));
    const regions = Array.isArray(draft.region_ids) ? draft.region_ids : (detail.region_ids ?? []);
    setRegionIds(regions.filter((item): item is number => typeof item === "number"));
    const location = "location" in draft ? draft.location : detail.location;
    setLocationAr(readLocalizedField(location, "ar"));
    setLocationEn(readLocalizedField(location, "en"));
    const service = "service_type" in draft ? draft.service_type : detail.service_type;
    setServiceAr(readLocalizedField(service, "ar"));
    setServiceEn(readLocalizedField(service, "en"));
    const yearValue = "year" in draft ? draft.year : detail.year;
    setYear(typeof yearValue === "number" ? String(yearValue) : "");
    const deliveryValue = "delivery_status" in draft ? draft.delivery_status : detail.delivery_status;
    setDelivery(typeof deliveryValue === "string" ? deliveryValue : "");
    const scope = "scope" in draft ? draft.scope : detail.scope;
    setScopeAr(stringList(scope, "ar"));
    setScopeEn(stringList(scope, "en"));
    const gallerySource = "gallery" in draft ? draft.gallery : detail.gallery;
    setGallery(galleryDraft(Array.isArray(gallerySource) ? (gallerySource as AdminGalleryItem[]) : []));
    setFeatured(Boolean(("is_featured" in draft ? draft.is_featured : detail.is_featured) ?? false));
    const featuredValue = "featured_order" in draft ? draft.featured_order : detail.featured_order;
    setFeaturedOrder(typeof featuredValue === "number" ? String(featuredValue) : "");
    const sortValue = "sort_order" in draft ? draft.sort_order : detail.sort_order;
    setSortOrder(typeof sortValue === "number" ? String(sortValue) : "");
    const seo = asRecord("seo" in draft ? draft.seo : detail.seo);
    const seoTitle = asRecord(seo?.title);
    const seoDescription = asRecord(seo?.description);
    setSeoTitleAr(typeof seoTitle?.ar === "string" ? seoTitle.ar : "");
    setSeoTitleEn(typeof seoTitle?.en === "string" ? seoTitle.en : "");
    setSeoDescriptionAr(typeof seoDescription?.ar === "string" ? seoDescription.ar : "");
    setSeoDescriptionEn(typeof seoDescription?.en === "string" ? seoDescription.en : "");
    const og = "og_image_media_id" in draft ? draft.og_image_media_id : detail.og_image_media_id;
    setOgImageId(typeof og === "number" ? og : null);
  }

  useEffect(() => {
    void adminProject(id).then(applyDetail).catch(() => setLoadError(true));
  }, [id]);

  const blockers = useMemo(() => {
    const local: AdminPublishBlocker[] = [];
    if (!titleAr.trim()) local.push({ field: "title.ar", code: "title_ar_required" });
    if (!titleEn.trim()) local.push({ field: "title.en", code: "title_en_required" });
    if (!hasVisibleText(overviewAr)) local.push({ field: "overview.ar", code: "overview_ar_required" });
    if (!hasVisibleText(overviewEn)) local.push({ field: "overview.en", code: "overview_en_required" });
    if (!slug.trim()) local.push({ field: "slug", code: "slug_required" });
    if (!clientId) local.push({ field: "client_id", code: "client_required" });
    if (!sectorId) local.push({ field: "sector_id", code: "sector_required" });
    if (gallery.length === 0) {
      local.push({ field: "gallery", code: "cover_required" });
    } else if (gallery.some((item) => item.media_id && (!item.alt.ar.trim() || !item.alt.en.trim()) && !item.key)) {
      local.push({ field: "gallery", code: "cover_alt_required" });
    }
    const fromApi = (project?.publish_blockers ?? []).filter((item) => item.code === "dispute_blocks_publish");
    return [...fromApi, ...local];
  }, [project, titleAr, titleEn, overviewAr, overviewEn, slug, clientId, sectorId, gallery]);

  function payload() {
    return {
      title: { ar: titleAr, en: titleEn },
      overview: { ar: overviewAr, en: overviewEn },
      slug,
      client_id: clientId ? Number(clientId) : null,
      sector_id: sectorId ? Number(sectorId) : null,
      region_ids: regionIds,
      location: { ar: locationAr, en: locationEn },
      service_type: { ar: serviceAr, en: serviceEn },
      year: year ? Number(year) : null,
      delivery_status: delivery || null,
      scope: { ar: scopeAr, en: scopeEn },
      gallery: gallery.map((item) => ({ key: item.key ?? null, media_id: item.media_id ?? null, alt: item.alt })),
      is_featured: featured,
      featured_order: featuredOrder ? Number(featuredOrder) : null,
      sort_order: sortOrder ? Number(sortOrder) : 0,
      seo: {
        title: { ar: seoTitleAr, en: seoTitleEn },
        description: { ar: seoDescriptionAr, en: seoDescriptionEn },
      },
      og_image_media_id: ogImageId,
    };
  }

  async function save(options: { confirmClear?: boolean } = {}) {
    setError(null);
    try {
      const next = await adminPatchProject(id, {
        ...payload(),
        ...(options.confirmClear ? { confirm_clear: true } : {}),
      });
      applyDetail(next);
      setMessage(t("saved"));
      setConfirmClear(false);
      return next;
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 422) {
        const clearRequired = Object.values(caught.errors ?? {}).some((messages) =>
          messages.some((message) => message.includes("clear_requires_confirm")),
        );
        if (clearRequired) {
          setConfirmClear(true);
          return null;
        }
      }
      setError(t("saveError"));
      return null;
    }
  }

  async function publish() {
    const saved = await save();
    if (!saved) {
      return;
    }
    try {
      const next = await adminPublishProject(id);
      applyDetail(next);
      setMessage(t("published"));
      setError(null);
    } catch (caught) {
      setError(caught instanceof ApiError ? t("publishBlocked") : t("publishBlocked"));
    }
  }

  async function preview() {
    const issued = await adminProjectPreviewToken(id, locale);
    window.open(`/cms/preview?token=${encodeURIComponent(issued.token)}&path=${encodeURIComponent(issued.path)}`, "_blank", "noopener");
  }

  function focusBlocker(code: string) {
    const target = BLOCKER_FOCUS[code];
    if (!target) {
      return;
    }
    if (target.lang) {
      setLangTab(target.lang);
    }
    window.requestAnimationFrame(() => {
      const node = document.getElementById(target.id);
      node?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (node instanceof HTMLElement) {
        node.focus();
      }
    });
  }

  if (loadError) {
    return <p className="text-danger" data-ready="true">{t("loadError")}</p>;
  }

  if (!project) {
    return <p className="text-muted" data-ready="false">{t("loading")}</p>;
  }

  const publishDisabled = blockers.length > 0 || project.status === "trashed";
  const lookups = project.lookups;
  const seoTitle = langTab === "ar" ? seoTitleAr || titleAr : seoTitleEn || titleEn;
  const seoDescription = langTab === "ar" ? seoDescriptionAr : seoDescriptionEn;
  const scope = langTab === "ar" ? scopeAr : scopeEn;
  const setScope = langTab === "ar" ? setScopeAr : setScopeEn;

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={<StatusPill locale={locale} status={project.has_unpublished_changes ? "published_with_draft" : project.status} />}
        breadcrumbs={t("edit")}
        subtitle={t("subtitle")}
        title={titleAr || titleEn || t("edit")}
      />
      {project.has_unpublished_changes ? <p className="text-body-s text-accent" data-draft-badge="true">{t("unpublished")}</p> : null}
      {message ? <p className="text-accent">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className="min-w-0 rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("basics")}</h2>
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
                <DashboardTextField error={blockers.some((item) => item.field === "title.ar") ? t("blockerTitleAr") : undefined} id="title-ar" label={t("titleLabel")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
                <div>
                  <p className="mb-2 text-label-s text-secondary">{t("overviewLabel")}</p>
                  <BlockEditor blocks={overviewAr} fieldId="overview-ar" onChange={setOverviewAr} />
                </div>
                <DashboardTextField id="location-ar" label={t("locationCity")} onChange={(event) => setLocationAr(event.target.value)} value={locationAr} />
                <DashboardTextField id="service-ar" label={t("serviceType")} onChange={(event) => setServiceAr(event.target.value)} value={serviceAr} />
              </div>
              <div className={langTab === "en" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField error={blockers.some((item) => item.field === "title.en") ? t("blockerTitleEn") : undefined} id="title-en" label={t("titleLabel")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
                <div>
                  <p className="mb-2 text-label-s text-secondary">{t("overviewLabel")}</p>
                  <BlockEditor blocks={overviewEn} fieldId="overview-en" onChange={setOverviewEn} />
                </div>
                <DashboardTextField id="location-en" label={t("locationCity")} onChange={(event) => setLocationEn(event.target.value)} value={locationEn} />
                <DashboardTextField id="service-en" label={t("serviceType")} onChange={(event) => setServiceEn(event.target.value)} value={serviceEn} />
              </div>
              <ScopeList items={scope} label={t("scope")} onChange={setScope} />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("relations")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardSelect error={blockers.some((item) => item.code === "client_required") ? t("blockerClient") : undefined} id="client" label={t("client")} onChange={(event) => setClientId(event.target.value)} value={clientId}>
                <option value="">{t("choose")}</option>
                {lookups?.clients.map((item) => <option key={item.id} value={item.id}>{lookupLabel(item, locale)}</option>)}
              </DashboardSelect>
              <DashboardSelect error={blockers.some((item) => item.code === "sector_required") ? t("blockerSector") : undefined} id="sector" label={t("sector")} onChange={(event) => setSectorId(event.target.value)} value={sectorId}>
                <option value="">{t("choose")}</option>
                {lookups?.sectors.map((item) => <option key={item.id} value={item.id}>{lookupLabel(item, locale)}</option>)}
              </DashboardSelect>
              <DashboardTextField id="year" inputMode="numeric" label={t("year")} onChange={(event) => setYear(event.target.value.replace(/[^\d]/g, ""))} value={year} />
              <DashboardSelect id="delivery" label={t("delivery")} onChange={(event) => setDelivery(event.target.value)} value={delivery}>
                <option value="">{t("choose")}</option>
                <option value="completed">{t("deliveryCompleted")}</option>
                <option value="ongoing">{t("deliveryOngoing")}</option>
              </DashboardSelect>
              <DashboardTextField dir="ltr" error={blockers.some((item) => item.code === "slug_required") ? t("blockerSlug") : undefined} id="slug" label={t("slug")} onChange={(event) => setSlug(event.target.value)} spellCheck={false} value={slug} />
              <DashboardTextField id="sort-order" inputMode="numeric" label={t("sortOrder")} onChange={(event) => setSortOrder(event.target.value.replace(/[^\d]/g, ""))} value={sortOrder} />
            </div>
            <div className="mt-4">
              <DashboardMultiSelect
                emptyLabel={t("regionsEmpty")}
                id="regions"
                label={t("regions")}
                onChange={setRegionIds}
                options={(lookups?.regions ?? []).map((item) => ({ id: item.id, label: lookupLabel(item, locale) }))}
                searchPlaceholder={t("regionsSearch")}
                selectedLabel={(count) => t("regionsSelected", { count })}
                values={regionIds}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-elevated p-5" data-blocked={blockers.some((item) => item.field === "gallery") ? "true" : undefined} id="gallery">
            <h2 className="mb-4 text-h5">{t("gallery")}</h2>
            {blockers.some((item) => item.field === "gallery") ? <p className="mb-3 text-caption text-danger">{t(blockers.some((item) => item.code === "cover_alt_required") ? "blockerCoverAlt" : "blockerCover")}</p> : null}
            <GalleryEditor items={gallery} onChange={setGallery} onPick={() => setPicker("gallery")} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("publishCard")}</h2>
            <div className="space-y-4">
              <StatusPill locale={locale} status={project.has_unpublished_changes ? "published_with_draft" : project.status} />
              <p className="text-caption text-muted">{t("lastPublished")}: {formatFullDateTime(project.published_at, locale)}</p>
              <DashboardSwitch checked={featured} id="featured" label={t("featured")} onChange={setFeatured} />
              {featured ? (
                <DashboardTextField id="featured-order" inputMode="numeric" label={t("featuredOrder")} onChange={(event) => setFeaturedOrder(event.target.value.replace(/[^\d]/g, ""))} value={featuredOrder} />
              ) : null}
              {blockers.length > 0 ? (
                <ul className="space-y-2 rounded-xl border border-danger/30 bg-danger/5 p-3" data-publish-blockers>
                  {blockers.map((item) => (
                    <li className="flex items-start justify-between gap-2 text-caption text-danger" key={item.code}>
                      <span>{t(BLOCKER_KEYS[item.code] ?? "publishBlocked")}</span>
                      {BLOCKER_FOCUS[item.code] ? (
                        <button className="shrink-0 text-accent underline" onClick={() => focusBlocker(item.code)} type="button">
                          {t("blockerGo")}
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="flex flex-col gap-2">
                <DashboardButton onClick={() => void save()} type="button" variant="secondary">{t("save")}</DashboardButton>
                <DashboardButton icon={<Icon name="eye" />} onClick={() => void preview()} type="button" variant="ghost">{t("preview")}</DashboardButton>
                {project.has_unpublished_changes ? (
                  <DashboardButton onClick={() => void adminDiscardProjectDraft(id).then(applyDetail)} type="button" variant="ghost">{t("discard")}</DashboardButton>
                ) : null}
                {project.status === "trashed" ? (
                  <DashboardButton onClick={() => void adminRestoreProject(id).then(applyDetail)} type="button">{t("restore")}</DashboardButton>
                ) : (
                  <DashboardButton
                    aria-disabled={publishDisabled || undefined}
                    className={publishDisabled ? "opacity-50 grayscale" : undefined}
                    disabled={publishDisabled}
                    disabledReason={publishDisabled ? t("publishBlocked") : undefined}
                    onClick={() => void publish()}
                    type="button"
                  >
                    {t("publish")}
                  </DashboardButton>
                )}
                <DashboardButton onClick={() => setConfirmDelete(true)} type="button" variant="ghost">{t("delete")}</DashboardButton>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("seoCard")}</h2>
            <div className="space-y-4">
              <DashboardTextField id={`seo-title-${langTab}`} label={t("seoTitle")} onChange={(event) => (langTab === "ar" ? setSeoTitleAr(event.target.value) : setSeoTitleEn(event.target.value))} value={langTab === "ar" ? seoTitleAr : seoTitleEn} />
              <DashboardTextField id={`seo-description-${langTab}`} label={t("seoDescription")} onChange={(event) => (langTab === "ar" ? setSeoDescriptionAr(event.target.value) : setSeoDescriptionEn(event.target.value))} value={langTab === "ar" ? seoDescriptionAr : seoDescriptionEn} />
              <DashboardButton onClick={() => setPicker("og")} type="button" variant="secondary">{t("ogImage")}</DashboardButton>
              {ogImageId ? <p className="text-caption text-muted">{t("ogSelected")}</p> : null}
              <div className="rounded-xl border border-line bg-base p-3">
                <p className="text-label-s text-accent">{seoTitle || t("seoTitleFallback")}</p>
                <p className="truncate text-start text-caption text-muted" dir="ltr">{`/${langTab}/projects/${slug}`}</p>
                <p className="text-caption text-secondary">{seoDescription || t("seoDescriptionFallback")}</p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <MediaPicker
        onClose={() => setPicker(null)}
        onSelect={(media) => {
          if (picker === "og") {
            setOgImageId(media.id);
            return;
          }
          setGallery((current) => [...current, { clientId: nextGalleryId(), media_id: media.id, url: media.url, alt: { ar: "", en: "" } }]);
        }}
        open={picker !== null}
      />
      <ConfirmDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("delete")}
        destructive
        message={t("deleteConfirm", { name: titleAr || titleEn || slug })}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          void adminDeleteProject(id).then(() => router.push("/dashboard/projects"));
        }}
        open={confirmDelete}
        title={t("delete")}
      />
      <ConfirmDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("clearConfirm")}
        destructive
        message={t("clearOverviewMessage")}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => void save({ confirmClear: true })}
        open={confirmClear}
        title={t("clearOverviewTitle")}
      />
    </div>
  );
}

function ScopeList({ items, label, onChange }: { items: string[]; label: string; onChange: (next: string[]) => void }) {
  const t = useTranslations("Dashboard.projects");
  const rows = items.length > 0 ? items : [""];

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) {
      return;
    }
    const next = [...rows];
    const current = next[index];
    const other = next[target];
    if (current === undefined || other === undefined) {
      return;
    }
    next[index] = other;
    next[target] = current;
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <p className="text-label-s text-secondary">{label}</p>
      {rows.map((item, index) => {
        const rowLabel = item.trim() || t("scopeEmpty", { index: index + 1 });
        return (
          <div className="flex min-w-0 items-end gap-2" key={`${label}-${index}`}>
            <div className="min-w-0 flex-1">
              <DashboardTextField
                id={`scope-${index}-${label}`}
                label={rowLabel}
                onChange={(event) => onChange(rows.map((row, rowIndex) => (rowIndex === index ? event.target.value : row)))}
                value={item}
              />
            </div>
            <button aria-label={t("scopeMoveUp")} className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg border border-line text-secondary hover:bg-highlight" onClick={() => move(index, -1)} type="button">
              <Icon className="rotate-180" name="chevron-down" />
            </button>
            <button aria-label={t("scopeMoveDown")} className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg border border-line text-secondary hover:bg-highlight" onClick={() => move(index, 1)} type="button">
              <Icon name="chevron-down" />
            </button>
            <button
              aria-label={t("scopeRemove")}
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg border border-line text-secondary hover:bg-highlight"
              onClick={() => onChange(rows.filter((_, rowIndex) => rowIndex !== index))}
              type="button"
            >
              <Icon name="trash" />
            </button>
          </div>
        );
      })}
      <DashboardButton icon={<Icon name="plus" />} onClick={() => onChange([...rows, ""])} type="button" variant="ghost">
        {t("addScope")}
      </DashboardButton>
    </div>
  );
}
