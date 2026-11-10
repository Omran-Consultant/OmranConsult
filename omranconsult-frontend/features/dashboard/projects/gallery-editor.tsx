"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable";
import Image from "next/image";
import { useTranslations } from "next-intl";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { dashboardCoverSrc } from "@/features/dashboard/projects/cover-image";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";

export type GalleryDraftItem = {
  clientId: string;
  key?: string | null;
  media_id?: number | null;
  url?: string | null;
  alt: { ar: string; en: string };
};

function itemSrc(item: GalleryDraftItem): string | null {
  return item.url || dashboardCoverSrc(item.key);
}

function SortableThumb({
  item,
  index,
  onAlt,
  onMove,
  onRemove,
}: {
  item: GalleryDraftItem;
  index: number;
  onAlt: (locale: "ar" | "en", value: string) => void;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("Dashboard.projects");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.clientId });
  const src = itemSrc(item);

  return (
    <li
      className={classNames("rounded-xl border border-line bg-highlight p-2", isDragging ? "opacity-70" : undefined)}
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
    >
      <button
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            onMove(index, index - 1);
          }
          if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            onMove(index, index + 1);
          }
        }}
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`${t("gallery")} ${index + 1}`}
      >
        {src ? <Image alt="" className="object-cover" fill sizes="180px" src={src} /> : <span className="grid size-full place-items-center text-muted"><Icon name="image" /></span>}
      </button>
      {index === 0 ? <span className="mt-2 inline-flex rounded-full bg-accent-strong px-2 py-0.5 text-caption text-white">{t("coverBadge")}</span> : null}
      <div className="mt-2 space-y-2">
        <DashboardTextField id={`${item.clientId}-alt-ar`} label={t("altAr")} onChange={(event) => onAlt("ar", event.target.value)} value={item.alt.ar} />
        <DashboardTextField id={`${item.clientId}-alt-en`} label={t("altEn")} onChange={(event) => onAlt("en", event.target.value)} value={item.alt.en} />
        <DashboardButton onClick={onRemove} type="button" variant="ghost">
          {t("removeImage")}
        </DashboardButton>
      </div>
    </li>
  );
}

export function GalleryEditor({
  items,
  onChange,
  onPick,
}: {
  items: GalleryDraftItem[];
  onChange: (next: GalleryDraftItem[]) => void;
  onPick: () => void;
}) {
  const t = useTranslations("Dashboard.projects");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    const from = items.findIndex((item) => item.clientId === active.id);
    const to = items.findIndex((item) => item.clientId === over.id);
    if (from < 0 || to < 0) {
      return;
    }
    onChange(arrayMove(items, from, to));
  }

  return (
    <div>
      <DashboardButton onClick={onPick} type="button" variant="secondary">
        {t("pickMedia")}
      </DashboardButton>
      {items.length === 0 ? <p className="mt-3 text-body-s text-muted">{t("galleryEmpty")}</p> : null}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
        <SortableContext items={items.map((item) => item.clientId)} strategy={rectSortingStrategy}>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <SortableThumb
                index={index}
                item={item}
                key={item.clientId}
                onAlt={(locale, value) =>
                  onChange(items.map((entry) => (entry.clientId === item.clientId ? { ...entry, alt: { ...entry.alt, [locale]: value } } : entry)))
                }
                onMove={(from, to) => {
                  if (to < 0 || to >= items.length) {
                    return;
                  }
                  onChange(arrayMove(items, from, to));
                }}
                onRemove={() => onChange(items.filter((entry) => entry.clientId !== item.clientId))}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <p className="mt-3 text-caption text-muted">{t("galleryHint")}</p>
    </div>
  );
}
