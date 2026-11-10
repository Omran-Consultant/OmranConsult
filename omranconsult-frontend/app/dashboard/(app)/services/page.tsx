"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { isIconName, Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { IconPicker, iconLabelKey } from "@/features/dashboard/services/icon-picker";
import { ActionMenu } from "@/features/dashboard/ui/action-menu";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import {
  adminCreateServiceCategory,
  adminCreateServiceItem,
  adminPatchServiceTools,
  adminPublishServiceCategory,
  adminReorderServiceCategories,
  adminReorderServiceItems,
  adminServiceTools,
  adminServices,
} from "@/lib/api/admin-browser";
import type { AdminServiceCategory, AdminServiceItem, AdminServiceToolsResponse } from "@/lib/api/types";

function label(value: { ar?: string | null; en?: string | null } | null | undefined, locale: AppLocale): string {
  if (!value) return "—";
  return (locale === "ar" ? value.ar : value.en) || value.ar || value.en || "—";
}

function SortableServiceRow({
  service,
  locale,
  onEdit,
}: {
  service: AdminServiceItem;
  locale: AppLocale;
  onEdit: () => void;
}) {
  const t = useTranslations("Dashboard.services");
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });

  return (
    <li
      className={`flex flex-wrap items-center gap-2 rounded-xl border border-line px-2 py-2 ${isDragging ? "opacity-70" : ""}`}
      data-service-id={String(service.id)}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        aria-label={t("dragHandle")}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-muted hover:bg-highlight"
        type="button"
        {...attributes}
        {...listeners}
      >
        <Icon name="list" />
      </button>
      <button className="min-w-0 flex-1 truncate text-start font-medium" onClick={onEdit} type="button">
        {label(service.title, locale)}
      </button>
      <StatusPill locale={locale} status={service.status} />
      <RowActionButton label={t("edit")} onClick={onEdit}>
        <Icon name="edit" />
      </RowActionButton>
    </li>
  );
}

function CategoryCard({
  category,
  index,
  total,
  collapsed,
  onToggle,
  onReload,
  onMoveCategory,
}: {
  category: AdminServiceCategory;
  index: number;
  total: number;
  collapsed: boolean;
  onToggle: () => void;
  onReload: () => Promise<void>;
  onMoveCategory: (from: number, to: number) => void;
}) {
  const t = useTranslations("Dashboard.services");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function kindLabel(kind: string): string {
    if (kind === "axis") return t("kindAxis");
    if (kind === "asset_management") return t("kindAsset");
    if (kind === "engineering_design") return t("kindEngineering");
    return kind;
  }

  function iconCaption(name: string | null): string | null {
    if (!name || !isIconName(name)) return null;
    const key = iconLabelKey(name);
    return t.has(`icons.${key}` as "icons.hard_hat") ? t(`icons.${key}` as "icons.hard_hat") : name;
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = category.services.map((item) => item.id);
    const from = ids.indexOf(Number(active.id));
    const to = ids.indexOf(Number(over.id));
    if (from < 0 || to < 0) return;
    void adminReorderServiceItems(category.id, arrayMove(ids, from, to)).then(onReload);
  }

  const caption = iconCaption(category.icon);

  return (
    <article className="rounded-2xl border border-line bg-elevated p-5" data-category-id={String(category.id)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button className="flex min-w-0 flex-1 items-start gap-3 text-start" onClick={onToggle} type="button">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-highlight text-accent">
            {category.icon && isIconName(category.icon) ? <Icon name={category.icon} /> : <Icon name="layers" />}
          </span>
          <span className="min-w-0 space-y-1">
            <span className="flex flex-wrap items-center gap-2">
              <h2 className="text-h5">{label(category.title, locale)}</h2>
              <StatusPill locale={locale} status={category.status} />
            </span>
            <span className="block text-caption text-muted">
              {kindLabel(category.kind)}
              {caption ? ` · ${caption}` : null}
              {` · ${t("itemCount", { count: category.services.length })}`}
            </span>
          </span>
          <Icon name={collapsed ? "chevron-right" : "chevron-down"} />
        </button>
        <div className="flex items-center gap-1">
          <RowActionButton label={t("edit")} onClick={() => router.push(`/dashboard/services/categories/${category.id}`)}>
            <Icon name="edit" />
          </RowActionButton>
          <RowActionButton disabled={index === 0} label={t("moveUp")} onClick={() => onMoveCategory(index, index - 1)}>
            <Icon className="-rotate-90" name="chevron-right" />
          </RowActionButton>
          <RowActionButton disabled={index >= total - 1} label={t("moveDown")} onClick={() => onMoveCategory(index, index + 1)}>
            <Icon className="rotate-90" name="chevron-right" />
          </RowActionButton>
          <ActionMenu
            items={[
              {
                id: "add",
                label: t("addItem"),
                onClick: () =>
                  void adminCreateServiceItem({ category_id: category.id }).then((created) =>
                    router.push(`/dashboard/services/items/${created.id}`),
                  ),
              },
              ...(category.status !== "published"
                ? [
                    {
                      id: "publish",
                      label: t("publish"),
                      onClick: () => void adminPublishServiceCategory(category.id).then(onReload),
                    },
                  ]
                : []),
            ]}
            label={t("more")}
          />
        </div>
      </div>

      {!collapsed ? (
        <div className="mt-4 space-y-3">
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd} sensors={sensors}>
            <SortableContext items={category.services.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {category.services.map((service) => (
                  <SortableServiceRow
                    key={service.id}
                    locale={locale}
                    onEdit={() => router.push(`/dashboard/services/items/${service.id}`)}
                    service={service}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <DashboardButton
            icon={<Icon name="plus" />}
            onClick={() =>
              void adminCreateServiceItem({ category_id: category.id }).then((created) =>
                router.push(`/dashboard/services/items/${created.id}`),
              )
            }
            type="button"
            variant="secondary"
          >
            {t("addItem")}
          </DashboardButton>
        </div>
      ) : null}
    </article>
  );
}

export default function ServicesAdminPage() {
  const t = useTranslations("Dashboard.services");
  const router = useRouter();
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [tools, setTools] = useState<AdminServiceToolsResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  async function reload() {
    const [list, toolsPayload] = await Promise.all([adminServices(), adminServiceTools()]);
    setCategories(list.data);
    setTools(toolsPayload);
    setLoaded(true);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void reload().catch(() => setLoaded(true));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  function moveCategory(from: number, to: number) {
    if (to < 0 || to >= categories.length) return;
    const order = arrayMove(
      categories.map((item) => item.id),
      from,
      to,
    );
    void adminReorderServiceCategories(order).then(reload);
  }

  if (!loaded) {
    return <p className="text-muted" data-ready="false">{t("loading")}</p>;
  }

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={
          <DashboardButton
            icon={<Icon name="plus" />}
            onClick={() =>
              void adminCreateServiceCategory({ kind: "axis", title: { ar: "", en: "" } }).then((created) =>
                router.push(`/dashboard/services/categories/${created.id}`),
              )
            }
            type="button"
          >
            {t("addCategory")}
          </DashboardButton>
        }
        subtitle={t("subtitle")}
        title={t("title")}
      />
      {message ? <p className="text-accent">{message}</p> : null}

      <section className="space-y-4">
        {categories.map((category, index) => (
          <CategoryCard
            category={category}
            collapsed={collapsed[category.id] ?? false}
            index={index}
            key={category.id}
            onMoveCategory={moveCategory}
            onReload={reload}
            onToggle={() => setCollapsed((current) => ({ ...current, [category.id]: !(current[category.id] ?? false) }))}
            total={categories.length}
          />
        ))}
      </section>

      {tools?.data[0] ? <ToolsEditor key={tools.data[0].id} onSaved={reload} setMessage={setMessage} tools={tools} /> : null}
    </div>
  );
}

function ToolsEditor({
  tools,
  onSaved,
  setMessage,
}: {
  tools: AdminServiceToolsResponse;
  onSaved: () => Promise<void>;
  setMessage: (value: string | null) => void;
}) {
  const t = useTranslations("Dashboard.services");
  const first = tools.data[0];
  const [items, setItems] = useState(first?.payload.items ?? []);

  if (!first) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-line bg-elevated p-5">
      <h2 className="mb-4 text-h5">{t("tools")}</h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div className="grid gap-3 rounded-xl border border-line p-3 md:grid-cols-2" key={index}>
            <DashboardTextField
              id={`tool-title-ar-${index}`}
              label={t("titleAr")}
              onChange={(event) =>
                setItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, title: { ...row.title, ar: event.target.value } } : row)))
              }
              value={item.title?.ar ?? ""}
            />
            <DashboardTextField
              id={`tool-title-en-${index}`}
              label={t("titleEn")}
              onChange={(event) =>
                setItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, title: { ...row.title, en: event.target.value } } : row)))
              }
              value={item.title?.en ?? ""}
            />
            <DashboardTextField
              id={`tool-body-ar-${index}`}
              label={t("bodyAr")}
              onChange={(event) =>
                setItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, body: { ...row.body, ar: event.target.value } } : row)))
              }
              value={item.body?.ar ?? ""}
            />
            <DashboardTextField
              id={`tool-body-en-${index}`}
              label={t("bodyEn")}
              onChange={(event) =>
                setItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, body: { ...row.body, en: event.target.value } } : row)))
              }
              value={item.body?.en ?? ""}
            />
            <div className="md:col-span-2">
              <IconPicker
                icons={tools.icons}
                onChange={(next) =>
                  setItems((current) =>
                    current.map((row, rowIndex) => (rowIndex === index ? { ...row, icon: next } : row)),
                  )
                }
                value={item.icon ?? ""}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <DashboardButton
          onClick={() =>
            void adminPatchServiceTools(items).then(() => {
              setMessage(t("saved"));
              void onSaved();
            })
          }
          type="button"
        >
          {t("saveTools")}
        </DashboardButton>
      </div>
    </section>
  );
}
