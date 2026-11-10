"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { isIconName, Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSelect, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import {
  adminCreateServiceCategory,
  adminCreateServiceItem,
  adminPatchServiceTools,
  adminPublishServiceCategory,
  adminPublishServiceItem,
  adminReorderServiceCategories,
  adminReorderServiceItems,
  adminServiceTools,
  adminServices,
} from "@/lib/api/admin-browser";
import type { AdminServiceCategory, AdminServiceToolsResponse } from "@/lib/api/types";

function label(value: { ar?: string | null; en?: string | null } | null | undefined, locale: AppLocale): string {
  if (!value) return "—";
  return (locale === "ar" ? value.ar : value.en) || value.ar || value.en || "—";
}

export default function ServicesAdminPage() {
  const t = useTranslations("Dashboard.services");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const router = useRouter();
  const [categories, setCategories] = useState<AdminServiceCategory[]>([]);
  const [tools, setTools] = useState<AdminServiceToolsResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function reload() {
    const [list, toolsPayload] = await Promise.all([adminServices(), adminServiceTools()]);
    setCategories(list.data);
    setTools(toolsPayload);
    setLoaded(true);
  }

  useEffect(() => {
    void reload().catch(() => setLoaded(true));
  }, []);

  function kindLabel(kind: string): string {
    if (kind === "axis") return t("kindAxis");
    if (kind === "asset_management") return t("kindAsset");
    if (kind === "engineering_design") return t("kindEngineering");
    return kind;
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
          <article className="rounded-2xl border border-line bg-elevated p-5" key={category.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  {category.icon && isIconName(category.icon) ? <Icon name={category.icon} /> : null}
                  <h2 className="text-h5">{label(category.title, locale)}</h2>
                  <StatusPill locale={locale} status={category.status} />
                </div>
                <p className="text-caption text-muted">
                  {kindLabel(category.kind)}
                  {category.slug ? (
                    <>
                      {" · "}
                      <span dir="ltr">{category.slug}</span>
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {index > 0 ? (
                  <DashboardButton
                    onClick={() => {
                      const order = categories.map((item) => item.id);
                      const previous = order[index - 1];
                      order[index - 1] = category.id;
                      order[index] = previous!;
                      void adminReorderServiceCategories(order).then(reload);
                    }}
                    type="button"
                    variant="ghost"
                  >
                    {t("moveUp")}
                  </DashboardButton>
                ) : null}
                <Link className="text-label-s text-accent underline" href={`/dashboard/services/categories/${category.id}`}>
                  {t("edit")}
                </Link>
                {category.status !== "published" ? (
                  <DashboardButton onClick={() => void adminPublishServiceCategory(category.id).then(reload)} type="button">
                    {t("publish")}
                  </DashboardButton>
                ) : null}
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {category.services.map((service) => (
                <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2" key={service.id}>
                  <span className="min-w-0 truncate">{label(service.title, locale)}</span>
                  <div className="flex items-center gap-2">
                    <StatusPill locale={locale} status={service.status} />
                    <Link className="text-caption text-accent underline" href={`/dashboard/services/items/${service.id}`}>
                      {t("edit")}
                    </Link>
                    {service.status !== "published" ? (
                      <DashboardButton onClick={() => void adminPublishServiceItem(service.id).then(reload)} type="button" variant="ghost">
                        {t("publish")}
                      </DashboardButton>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
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
              {category.services.length > 1 ? (
                <DashboardButton
                  onClick={() => void adminReorderServiceItems(category.id, [...category.services].reverse().map((item) => item.id)).then(reload)}
                  type="button"
                  variant="ghost"
                >
                  {t("reverseItems")}
                </DashboardButton>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      {tools ? <ToolsEditor onSaved={reload} setMessage={setMessage} tools={tools} /> : null}
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

  useEffect(() => {
    setItems(first?.payload.items ?? []);
  }, [first]);

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
            <DashboardSelect
              id={`tool-icon-${index}`}
              label={t("icon")}
              onChange={(event) => setItems((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, icon: event.target.value } : row)))}
              value={item.icon ?? ""}
            >
              {tools.icons.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </DashboardSelect>
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
