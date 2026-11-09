"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { formatFullDateTime } from "@/features/dashboard/format/relative-time";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { GalleryEditor } from "@/features/dashboard/projects/gallery-editor";
import { readLocalizedField, readLocalizedFieldPreferringLive } from "@/features/dashboard/projects/localized-field";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSwitch, DashboardTextField, DashboardTextarea } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import {
  adminDiscardProjectDraft,
  adminPatchProject,
  adminProject,
  adminProjectPreviewToken,
  adminPublishProject,
} from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";
import type { AdminProjectDetail } from "@/lib/api/types";
import type { AppLocale } from "@/i18n/routing";

export default function ProjectEditorPage() {
  const t = useTranslations("Dashboard.projects");
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [overviewAr, setOverviewAr] = useState("");
  const [overviewEn, setOverviewEn] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function applyDetail(detail: AdminProjectDetail) {
    const draft = detail.draft ?? {};
    setProject(detail);
    setTitleAr(readLocalizedFieldPreferringLive(draft.title, detail.title, "ar"));
    setTitleEn(readLocalizedFieldPreferringLive(draft.title, detail.title, "en"));
    setOverviewAr(readLocalizedFieldPreferringLive(draft.overview, detail.overview, "ar"));
    setOverviewEn(readLocalizedFieldPreferringLive(draft.overview, detail.overview, "en"));
    const draftGallery = Array.isArray(draft.gallery) ? (draft.gallery as string[]) : null;
    setGallery(draftGallery && draftGallery.length > 0 ? draftGallery : (detail.gallery ?? []));
    setFeatured(Boolean(draft.is_featured ?? detail.is_featured));
  }

  useEffect(() => {
    void adminProject(id).then(applyDetail);
  }, [id]);

  const blockers = useMemo(() => {
    const fromApi = project?.publish_blockers ?? [];
    const local: string[] = [];
    if (!titleAr.trim() || !titleEn.trim()) {
      local.push("title_required");
    }
    if (!overviewAr.trim() || !overviewEn.trim()) {
      local.push("overview_required");
    }
    if (gallery.length === 0) {
      local.push("cover_required");
    }
    return [...new Set([...fromApi, ...local])];
  }, [project, titleAr, titleEn, overviewAr, overviewEn, gallery]);

  async function save() {
    setError(null);
    const next = await adminPatchProject(id, {
      title: { ar: titleAr, en: titleEn },
      overview: { ar: overviewAr, en: overviewEn },
      gallery,
      is_featured: featured,
    });
    applyDetail(next);
    setMessage(t("saved"));
  }

  async function publish() {
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
    window.open(`/cms/preview?token=${encodeURIComponent(issued.token)}&path=${encodeURIComponent(issued.path)}`, "_blank");
  }

  if (!project) {
    return null;
  }

  const publishDisabled = blockers.length > 0;
  const clientName = readLocalizedField(project.client_name, locale);
  const sectorName = readLocalizedField(project.sector_name, locale);
  const location = readLocalizedField(project.location, locale);
  const scopeItems = locale === "ar" ? (project.scope?.ar ?? []) : (project.scope?.en ?? []);

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={
          <DashboardButton
            disabled={publishDisabled}
            disabledReason={publishDisabled ? t("publishBlocked") : undefined}
            onClick={() => void publish()}
            type="button"
          >
            {t("publish")}
          </DashboardButton>
        }
        breadcrumbs={project.slug}
        subtitle={t("subtitle")}
        title={t("edit")}
      />
      {project.has_unpublished_changes ? (
        <p className="text-body-s text-accent" data-draft-badge="true">
          {t("unpublished")}
        </p>
      ) : null}
      {message ? <p className="text-accent">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-elevated p-5">
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
                <DashboardTextField id="title-ar" label={t("titleLabel")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
                <DashboardTextarea id="overview-ar" label={t("overviewLabel")} onChange={(event) => setOverviewAr(event.target.value)} value={overviewAr} />
              </div>
              <div className={langTab === "en" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-en" label={t("titleLabel")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
                <DashboardTextarea id="overview-en" label={t("overviewLabel")} onChange={(event) => setOverviewEn(event.target.value)} value={overviewEn} />
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("gallery")}</h2>
            <GalleryEditor items={gallery} onChange={setGallery} />
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-h5">{t("relatedFields")}</h2>
              <span className="text-caption text-muted">{t("editIn5b")}</span>
            </div>
            <dl className="grid gap-3 text-body-s sm:grid-cols-2">
              <Fact label={t("client")} value={clientName || "—"} />
              <Fact label={t("sector")} value={sectorName || "—"} />
              <Fact label={t("location")} value={location || "—"} />
              <Fact label={t("year")} value={project.year ? String(project.year) : "—"} />
            </dl>
            {scopeItems.length > 0 ? (
              <div className="mt-4">
                <p className="text-label-s text-secondary">{t("scope")}</p>
                <ul className="mt-2 list-disc ps-5 text-body-s">
                  {scopeItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-4 text-body-s text-muted">{t("scope")}: —</p>
            )}
          </section>
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("publishCard")}</h2>
            <div className="space-y-4">
              <StatusPill locale={locale} status={project.status} />
              <p className="text-caption text-muted">
                {t("lastPublished")}: {formatFullDateTime(project.published_at, locale)}
              </p>
              <DashboardSwitch checked={featured} id="featured" label={t("featured")} onChange={setFeatured} />
              <div className="flex flex-col gap-2">
                <DashboardButton onClick={() => void save()} type="button" variant="secondary">
                  {t("save")}
                </DashboardButton>
                <DashboardButton icon={<Icon name="eye" />} onClick={() => void preview()} type="button" variant="ghost">
                  {t("preview")}
                </DashboardButton>
                {project.has_unpublished_changes ? (
                  <DashboardButton
                    onClick={() => void adminDiscardProjectDraft(id).then(applyDetail)}
                    type="button"
                    variant="ghost"
                  >
                    {t("discard")}
                  </DashboardButton>
                ) : null}
                <DashboardButton
                  disabled={publishDisabled}
                  disabledReason={publishDisabled ? t("publishBlocked") : undefined}
                  onClick={() => void publish()}
                  type="button"
                >
                  {t("publish")}
                </DashboardButton>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5 text-body-s text-muted">
            <h2 className="mb-2 text-h5 text-primary">{t("seoCard")}</h2>
            <p>{t("seoSoon")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="text-primary">{value}</dd>
    </div>
  );
}
