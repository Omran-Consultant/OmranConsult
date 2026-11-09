"use client";

import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import Image from "next/image";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";

import { Icon } from "@/core/ui/icon";
import { dashboardCoverSrc } from "@/features/dashboard/projects/cover-image";
import { classNames } from "@/core/ui/class-names";

function SortableThumb({
  id,
  index,
  coverLabel,
  onMove,
}: {
  id: string;
  index: number;
  coverLabel: string;
  onMove: (from: number, to: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const src = dashboardCoverSrc(id);

  return (
    <li
      className={classNames(
        "relative overflow-hidden rounded-xl border border-line bg-highlight",
        isDragging ? "opacity-70" : undefined,
      )}
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      }}
    >
      <button
        className="relative block aspect-[4/3] w-full"
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
      >
        {src ? (
          <Image alt="" className="size-full object-cover" fill sizes="160px" src={src} />
        ) : (
          <span className="grid size-full place-items-center text-muted">
            <Icon name="image" />
          </span>
        )}
      </button>
      {index === 0 ? (
        <span className="absolute start-2 top-2 rounded-full bg-accent-strong px-2 py-0.5 text-caption text-white">
          {coverLabel}
        </span>
      ) : null}
    </li>
  );
}

export function GalleryEditor({ items, onChange }: { items: string[]; onChange: (next: string[]) => void }) {
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
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (from < 0 || to < 0) {
      return;
    }
    onChange(arrayMove(items, from, to));
  }

  function onMove(from: number, to: number) {
    if (to < 0 || to >= items.length) {
      return;
    }
    onChange(arrayMove(items, from, to));
  }

  if (items.length === 0) {
    return <p className="text-body-s text-muted">{t("galleryEmpty")}</p>;
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((key, index) => (
            <SortableThumb coverLabel={t("coverBadge")} id={key} index={index} key={key} onMove={onMove} />
          ))}
        </ul>
      </SortableContext>
      <p className="mt-3 text-caption text-muted">{t("galleryHint")}</p>
    </DndContext>
  );
}
