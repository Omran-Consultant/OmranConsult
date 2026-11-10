"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { BlockEditor } from "@/features/dashboard/content/block-editor";
import type { ContentBlock } from "@/core/content/blocks";

import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { Icon } from "@/core/ui/icon";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { Skeleton } from "@/core/ui/skeleton";
import { Avatar } from "@/features/dashboard/ui/avatar";
import { DashboardCheckbox } from "@/features/dashboard/ui/checkbox";
import { ConfirmDialog } from "@/features/dashboard/ui/confirm-dialog";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { DonutChart } from "@/features/dashboard/ui/charts/donut-chart";
import { FileDrop } from "@/features/dashboard/ui/file-drop";
import { FilterBar } from "@/features/dashboard/ui/filter-bar";
import { KpiCard } from "@/features/dashboard/ui/kpi-card";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { RoleBadge } from "@/features/dashboard/ui/role-badge";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import { ViewToggle } from "@/features/dashboard/ui/view-toggle";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";
import type { AppLocale } from "@/i18n/routing";

export default function DashboardUiGalleryPage() {
  const t = useTranslations("Dashboard.uiGallery");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const { user, loading } = useDashboardSession();

  if (loading) {
    return <Skeleton className="h-40" data-ready="false" />;
  }

  if (!user?.roles.includes("super_admin")) {
    return (
      <div className="p-6 text-body-s text-muted" data-ready="true">
        {t("forbidden")}
      </div>
    );
  }

  return (
    <div className="space-y-10" data-ready="true">
      <PageHeader subtitle={t("subtitle")} title={t("title")} />
      <section className="space-y-4">
        <h2 className="text-h5">{t("kpis")}</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            accent="#0e8442"
            footer={<span>{t("sampleFooter")}</span>}
            icon={<Icon name="layers" />}
            label={t("sampleKpi")}
            locale={locale}
            unit={locale === "ar" ? "عنصر" : "items"}
            value={12}
          />
        </div>
      </section>
      <section className="space-y-4" data-dashboard-toolbar>
        <h2 className="text-h5">{t("controls")}</h2>
        <FilterBar>
          <input className={`${controlMdClass} w-60`} readOnly type="search" value={t("search")} />
          <DashboardTabs active="a" onChange={() => undefined} tabs={[{ id: "a", label: t("tab"), count: 3 }]} />
          <ViewToggle gridLabel={t("grid")} onChange={() => undefined} tableLabel={t("tableMode")} value="table" />
          <DashboardButton type="button">
            {t("primary")}
          </DashboardButton>
        </FilterBar>
        <DashboardTextField id="gallery-field" label={t("field")} readOnly value={t("sample")} />
        <DashboardCheckbox checked description={t("checkboxHint")} id="gallery-check" label={t("checkbox")} onChange={() => undefined} />
        <FileDrop hint={t("fileHint")} label={t("fileDrop")} />
        <BlockSample />
      </section>
      <section className="space-y-4">
        <h2 className="text-h5">{t("metadata")}</h2>
        <div className="flex flex-wrap gap-3">
          <StatusPill locale={locale} status="published" />
          <RoleBadge locale={locale} role="editor" />
          <Avatar name="Gallery User" />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-h5">{t("table")}</h2>
        <DataTable
          columns={[{ id: "name", header: t("name"), cell: () => t("sampleRow") }]}
          emptyTitle={t("empty")}
          mobileCard={() => <p>{t("sampleRow")}</p>}
          rowActions={() => (
            <RowActionButton label={t("action")}>
              <Icon name="dots" />
            </RowActionButton>
          )}
          rows={[{ id: 1 }]}
        />
      </section>
      <section className="space-y-4">
        <h2 className="text-h5">{t("charts")}</h2>
        <DonutChart
          centerLabel={t("sample")}
          locale={locale}
          slices={[
            { id: "a", label: "A", value: 3 },
            { id: "b", label: "B", value: 2 },
          ]}
          title={t("donut")}
        />
      </section>
      <ConfirmDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("confirm")}
        message={t("confirmBody")}
        onCancel={() => undefined}
        onConfirm={() => undefined}
        open={false}
        title={t("confirmTitle")}
      />
    </div>
  );
}

function BlockSample() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([{ type: "paragraph", children: [{ text: "" }] }]);
  return <BlockEditor blocks={blocks} onChange={setBlocks} />;
}
