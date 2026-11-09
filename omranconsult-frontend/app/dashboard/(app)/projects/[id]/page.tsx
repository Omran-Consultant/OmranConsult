"use client";

import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import {
  adminDiscardProjectDraft,
  adminPatchProject,
  adminProject,
  adminProjectPreviewToken,
  adminPublishProject,
} from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";
import type { AdminProjectDetail } from "@/lib/api/types";

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
  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [overviewAr, setOverviewAr] = useState("");
  const [overviewEn, setOverviewEn] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
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
    const locale = readDashboardLocaleFromDocument();
    const issued = await adminProjectPreviewToken(id, locale);
    window.open(`/cms/preview?token=${encodeURIComponent(issued.token)}&path=${encodeURIComponent(issued.path)}`, "_blank");
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6" data-ready="true">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-h3">{t("edit")}</h1>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void save()} type="button" variant="secondary">
            {t("save")}
          </Button>
          <Button onClick={() => void preview()} type="button" variant="ghost">
            {t("preview")}
          </Button>
          <Button onClick={() => void publish()} type="button">
            {t("publish")}
          </Button>
          {project.has_unpublished_changes ? (
            <Button onClick={() => void adminDiscardProjectDraft(id).then(applyDetail)} type="button" variant="ghost">
              {t("discard")}
            </Button>
          ) : null}
        </div>
      </div>
      {project.has_unpublished_changes ? (
        <p className="text-body-s text-accent" data-draft-badge="true">
          {t("unpublished")}
        </p>
      ) : null}
      {message ? <p className="text-accent">{message}</p> : null}
      {error ? <p className="text-danger">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <InputField id="title-ar" label={t("titleAr")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
        <InputField id="title-en" label={t("titleEn")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
        <InputField id="overview-ar" label={t("overviewAr")} onChange={(event) => setOverviewAr(event.target.value)} value={overviewAr} />
        <InputField id="overview-en" label={t("overviewEn")} onChange={(event) => setOverviewEn(event.target.value)} value={overviewEn} />
      </div>
      <div>
        <h2 className="mb-2 text-label-m">{t("gallery")}</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={gallery} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {gallery.map((key) => (
                <SortableKey id={key} key={key} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
