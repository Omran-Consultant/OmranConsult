"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { Skeleton } from "@/core/ui/skeleton";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { useDashboardToast } from "@/features/dashboard/ui/toast";
import type { AppLocale } from "@/i18n/routing";
import { adminHomeSectors, adminPublishHomeSectors } from "@/lib/api/admin-browser";
import type { AdminHomeSectors } from "@/lib/api/types";

function SortableSector({ slug, name, position, onRemove, locked }: { slug: string; name: string; position: number; onRemove: () => void; locked: boolean }) {
  const t = useTranslations("Dashboard.pages");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slug, disabled: locked });

  return (
    <li
      className={`flex items-center gap-2 rounded-xl border border-line bg-elevated px-2 py-1.5 ${isDragging ? "opacity-70" : ""}`}
      data-home-sector={slug}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {locked ? null : (
        <button
          aria-label={`${t("dragHandle")}: ${name}`}
          className="grid size-11 shrink-0 cursor-grab place-items-center rounded-lg text-muted hover:bg-highlight"
          type="button"
          {...attributes}
          {...listeners}
        >
          <Icon name="list" />
        </button>
      )}
      <span className="font-latin text-caption text-muted" dir="ltr">
        {String(position).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 truncate text-body-s font-medium">{name}</span>
      {locked ? null : (
        <RowActionButton label={t("removeSector", { name })} onClick={onRemove}>
          <Icon name="close" />
        </RowActionButton>
      )}
    </li>
  );
}

/** The ordered sector chips on Home (Q21): pick from the published sectors, drag to order, publish. */
export function HomeSectorsTab({ locale }: { readonly locale: AppLocale }) {
  const t = useTranslations("Dashboard.pages");
  const { can } = useDashboardSession();
  const pushToast = useDashboardToast();
  const [data, setData] = useState<AdminHomeSectors | null>(null);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = !can("content.pages.publish");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function apply(next: AdminHomeSectors) {
    setData(next);
    setSlugs(next.slugs);
    setDirty(false);
    setError(null);
  }

  function load() {
    void adminHomeSectors()
      .then(apply)
      .catch(() => setFailed(true));
  }

  useEffect(load, []);

  function retry() {
    setFailed(false);
    load();
  }

  if (failed) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-body-s text-danger" data-ready="true">
        <p>{t("loadError")}</p>
        <button className="mt-3 text-label-s text-accent underline" onClick={retry} type="button">
          {t("retry")}
        </button>
      </div>
    );
  }
  if (!data) {
    return <Skeleton className="h-64 w-full" data-ready="false" />;
  }

  const names = new Map(data.sectors.map((sector) => [sector.slug, (locale === "ar" ? sector.name?.ar : sector.name?.en) || sector.name?.ar || sector.name?.en || ""]));
  // A selected sector that is no longer published is dropped from the list the editor can publish.
  const selected = slugs.filter((slug) => names.has(slug));
  const available = data.sectors.filter((sector) => !selected.includes(sector.slug));
  const full = selected.length >= data.max;

  function update(next: string[]) {
    setSlugs(next);
    setDirty(true);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = selected.indexOf(String(active.id));
    const to = selected.indexOf(String(over.id));
    if (from >= 0 && to >= 0) {
      update(arrayMove(selected, from, to));
    }
  }

  async function publish() {
    setBusy(true);
    try {
      apply(await adminPublishHomeSectors(selected));
      pushToast(t("orderPublished"));
    } catch {
      setError(t("publishError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4" data-ready="true">
      <p className="text-body-s text-secondary">{t("sectorsIntro", { max: data.max })}</p>
      {data.is_default && !dirty ? <p className="text-caption text-muted">{t("defaultOrder")}</p> : null}
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-body-s text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
        <section className="min-w-0 space-y-3 rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("selected")}</h2>
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
            <SortableContext items={selected} strategy={verticalListSortingStrategy}>
              <ol className="space-y-2" data-home-sectors-selected="">
                {selected.map((slug, index) => (
                  <SortableSector
                    key={slug}
                    locked={locked}
                    name={names.get(slug) ?? ""}
                    onRemove={() => update(selected.filter((item) => item !== slug))}
                    position={index + 1}
                    slug={slug}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
          {locked ? null : (
            <DashboardButton disabled={!dirty || selected.length === 0} loading={busy} onClick={() => void publish()}>
              {t("publishOrder")}
            </DashboardButton>
          )}
        </section>
        {locked ? null : (
          <section className="min-w-0 space-y-3 rounded-2xl border border-line bg-elevated p-5">
            <h2 className="text-h5">{t("available")}</h2>
            {full ? <p className="text-caption text-muted">{t("maxReached", { max: data.max })}</p> : null}
            {available.length === 0 ? <p className="text-body-s text-muted">{t("noneAvailable")}</p> : null}
            <ul className="flex flex-wrap gap-2" data-home-sectors-available="">
              {available.map((sector) => {
                const name = names.get(sector.slug) ?? "";
                return (
                  <li key={sector.slug}>
                    <DashboardButton
                      disabled={full}
                      icon={<Icon name="plus" />}
                      onClick={() => update([...selected, sector.slug])}
                      title={t("addSector", { name })}
                      variant="secondary"
                    >
                      {name}
                    </DashboardButton>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
