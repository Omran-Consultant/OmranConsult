"use client";

import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/core/ui/button";
import { Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";
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

function SortableKey({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <li
      className="rounded-md border border-line px-3 py-2 text-body-s"
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      {id}
    </li>
  );
}

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
    const source = (detail.draft as AdminProjectDetail | null) ?? detail;
    setProject(detail);
    setTitleAr(String(source.title?.ar ?? detail.title.ar ?? ""));
    setTitleEn(String(source.title?.en ?? detail.title.en ?? ""));
    setOverviewAr(String((source.overview as { ar?: string } | null)?.ar ?? detail.overview?.ar ?? ""));
    setOverviewEn(String((source.overview as { en?: string } | null)?.en ?? detail.overview?.en ?? ""));
    setGallery((source.gallery as string[] | null) ?? detail.gallery ?? []);
    setFeatured(detail.is_featured);
  }

  useEffect(() => {
    void adminProject(id).then(applyDetail);
  }, [id]);

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    setGallery((items) => arrayMove(items, items.indexOf(String(active.id)), items.indexOf(String(over.id))));
  }

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

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button className={controlMdClass} onClick={() => void save()} type="button" variant="secondary">
              {t("save")}
            </Button>
            <Button className={controlMdClass} onClick={() => void preview()} type="button" variant="ghost">
              {t("preview")}
            </Button>
            <Button className={controlMdClass} onClick={() => void publish()} type="button">
              {t("publish")}
            </Button>
            {project.has_unpublished_changes ? (
              <Button
                className={controlMdClass}
                onClick={() => void adminDiscardProjectDraft(id).then(applyDetail)}
                type="button"
                variant="ghost"
              >
                {t("discard")}
              </Button>
            ) : null}
          </div>
        }
        breadcrumbs={project.slug}
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
                { id: "ar", label: t("titleAr") },
                { id: "en", label: t("titleEn") },
              ]}
            />
            <div className="mt-4 space-y-4">
              <div className={langTab === "ar" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-ar" label={t("titleAr")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
                <DashboardTextarea id="overview-ar" label={t("overviewAr")} onChange={(event) => setOverviewAr(event.target.value)} value={overviewAr} />
              </div>
              <div className={langTab === "en" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-en" label={t("titleEn")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
                <DashboardTextarea id="overview-en" label={t("overviewEn")} onChange={(event) => setOverviewEn(event.target.value)} value={overviewEn} />
              </div>
            </div>
          </section>
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("gallery")}</h2>
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={gallery} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  {gallery.map((key) => (
                    <SortableKey id={key} key={key} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </section>
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("publishCard")}</h2>
            <div className="space-y-3">
              <StatusPill locale={locale} status={project.status} />
              <DashboardSwitch checked={featured} id="featured" label={t("featured")} onChange={setFeatured} />
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
