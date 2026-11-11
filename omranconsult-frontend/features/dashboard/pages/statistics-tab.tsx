"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { formatStatisticValue } from "@/core/format/statistic";
import { Icon } from "@/core/ui/icon";
import { statisticLabel } from "@/features/dashboard/pages/field-labels";
import { LocaleFields } from "@/features/dashboard/pages/locale-fields";
import { PagesPublishCard } from "@/features/dashboard/pages/publish-card";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { DashboardSelect, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { Drawer } from "@/features/dashboard/ui/drawer";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { useDashboardToast } from "@/features/dashboard/ui/toast";
import type { AppLocale } from "@/i18n/routing";
import { adminDiscardStatisticDraft, adminPatchStatistic, adminPublishStatistic, adminStatistics } from "@/lib/api/admin-browser";
import type { AdminLocaleText, AdminStatistic } from "@/lib/api/types";

const SUFFIXES = ["+", "%"];

type StatisticForm = {
  value: string;
  suffix: string;
  scale: string;
  unit: { ar: string; en: string };
  label: { ar: string; en: string };
};

function text(value: AdminLocaleText | null | undefined): { ar: string; en: string } {
  return { ar: value?.ar ?? "", en: value?.en ?? "" };
}

function formOf(statistic: AdminStatistic): StatisticForm {
  const source = { ...statistic, ...(statistic.draft ?? {}) };
  return {
    value: String(source.value),
    suffix: source.suffix ?? "",
    scale: source.scale ?? "",
    unit: text(source.unit),
    label: text(source.label),
  };
}

function bodyOf(form: StatisticForm) {
  const hasUnit = form.unit.ar.trim() !== "" || form.unit.en.trim() !== "";
  return {
    value: Number(form.value),
    suffix: form.suffix || null,
    scale: form.scale || null,
    unit: hasUnit ? form.unit : null,
    label: form.label,
  };
}

function display(value: number, scale: string | null, suffix: string | null, unit: AdminLocaleText | null, locale: AppLocale): string {
  return formatStatisticValue({ value, scale, suffix, unit: locale === "ar" ? unit?.ar : unit?.en, locale });
}

/** Statistics: the figure, its scale and suffix, the unit and the label in both languages. */
export function StatisticsTab({ locale }: { readonly locale: AppLocale }) {
  const t = useTranslations("Dashboard.pages");
  const { can } = useDashboardSession();
  const pushToast = useDashboardToast();
  const [statistics, setStatistics] = useState<AdminStatistic[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<StatisticForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readOnly = !can("content.pages.update");

  function load() {
    void adminStatistics()
      .then((response) => setStatistics(response.data))
      .catch(() => setFailed(true));
  }

  useEffect(load, []);

  function retry() {
    setFailed(false);
    load();
  }

  const editing = statistics?.find((statistic) => statistic.id === editingId) ?? null;
  const valueInvalid = form ? form.value.trim() === "" || !Number.isFinite(Number(form.value)) || Number(form.value) < 0 : false;

  function open(statistic: AdminStatistic) {
    setEditingId(statistic.id);
    setForm(formOf(statistic));
    setDirty(false);
    setError(null);
  }

  function replace(next: AdminStatistic) {
    setStatistics((current) => current?.map((statistic) => (statistic.id === next.id ? next : statistic)) ?? null);
    setForm(formOf(next));
    setDirty(false);
    setError(null);
  }

  async function run(action: () => Promise<AdminStatistic | null>, done: string, failedMessage: string) {
    setBusy(true);
    try {
      const next = await action();
      if (next) {
        replace(next);
        pushToast(done);
      }
    } catch {
      setError(failedMessage);
    } finally {
      setBusy(false);
    }
  }

  async function publish(statistic: AdminStatistic): Promise<AdminStatistic | null> {
    let current = statistic;
    if (dirty && form) {
      current = await adminPatchStatistic(statistic.id, bodyOf(form));
      replace(current);
    }
    if (current.publish_blockers.length > 0) {
      setError(t("publishBlocked"));
      return null;
    }
    return adminPublishStatistic(statistic.id);
  }

  function change(patch: Partial<StatisticForm>) {
    setForm((current) => (current ? { ...current, ...patch } : current));
    setDirty(true);
  }

  const pickText = (value: AdminLocaleText | null) => (locale === "ar" ? value?.ar : value?.en) || "—";

  return (
    <div className="space-y-4" data-ready={statistics || failed ? "true" : "false"}>
      <p className="text-body-s text-secondary">{t("statsIntro")}</p>
      <DataTable
        columns={[
          { id: "statistic", header: t("colStatistic"), width: "22%", cell: (row) => <span className="font-medium">{statisticLabel(row.key, locale)}</span> },
          {
            id: "value",
            header: t("colValue"),
            width: "14%",
            cell: (row) => (
              <span className="font-latin text-body-m font-semibold" dir="ltr">
                {display(row.value, row.scale, row.suffix, row.unit, locale)}
              </span>
            ),
          },
          { id: "label", header: t("colLabel"), cell: (row) => <span className="line-clamp-2 text-secondary">{pickText(row.label)}</span> },
          { id: "status", header: t("colStatus"), width: "11rem", cell: (row) => <StatusPill locale={locale} status={row.status} /> },
        ]}
        actionsWidth="4.5rem"
        emptyTitle={t("empty")}
        error={failed ? t("loadError") : null}
        loading={!statistics && !failed}
        mobileCard={(row) => (
          <button
            className="block w-full rounded-2xl border border-line bg-elevated p-4 text-start"
            data-statistic-key={row.key}
            key={row.id}
            onClick={() => open(row)}
            type="button"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-latin text-h5 font-semibold" dir="ltr">
                {display(row.value, row.scale, row.suffix, row.unit, locale)}
              </span>
              <StatusPill locale={locale} status={row.status} />
            </span>
            <span className="mt-2 block text-body-s text-secondary">{pickText(row.label)}</span>
          </button>
        )}
        onRetry={retry}
        onRowClick={open}
        retryLabel={t("retry")}
        rowActions={(row) => (
          <RowActionButton label={t("edit")} onClick={() => open(row)}>
            <Icon name="edit" />
          </RowActionButton>
        )}
        rows={statistics ?? []}
      />

      <Drawer
        onClose={() => setEditingId(null)}
        open={Boolean(editing && form)}
        title={editing ? `${t("editStatistic")}: ${statisticLabel(editing.key, locale)}` : ""}
      >
        {editing && form ? (
          <div className="space-y-5" data-statistic-editor={editing.key}>
            {error ? (
              <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-body-s text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <div className="rounded-xl border border-line bg-highlight/40 p-4 text-center">
              <p className="text-caption text-muted">{t("preview")}</p>
              <p className="font-latin text-h3 font-semibold text-accent" data-statistic-preview="" dir="ltr">
                {valueInvalid ? "—" : display(Number(form.value), form.scale || null, form.suffix || null, form.unit, locale)}
              </p>
            </div>
            <DashboardTextField
              dir="ltr"
              disabled={readOnly}
              error={valueInvalid ? t("blockerValue") : undefined}
              id="statistic-value"
              inputMode="decimal"
              label={t("value")}
              onChange={(event) => change({ value: event.target.value })}
              value={form.value}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <DashboardSelect disabled={readOnly} id="statistic-scale" label={t("scale")} onChange={(event) => change({ scale: event.target.value })} value={form.scale}>
                <option value="">{t("scaleNone")}</option>
                <option value="million">{t("scaleMillion")}</option>
                <option value="billion">{t("scaleBillion")}</option>
              </DashboardSelect>
              <DashboardSelect disabled={readOnly} id="statistic-suffix" label={t("suffix")} onChange={(event) => change({ suffix: event.target.value })} value={form.suffix}>
                <option value="">{t("suffixNone")}</option>
                {[...new Set([...SUFFIXES, ...(form.suffix ? [form.suffix] : [])])].map((suffix) => (
                  <option key={suffix} value={suffix}>
                    {suffix}
                  </option>
                ))}
              </DashboardSelect>
            </div>
            <LocaleFields>
              {(lang) => (
                <>
                  <DashboardTextField
                    dir="auto"
                    disabled={readOnly}
                    id={`statistic-label-${lang}`}
                    label={t("label")}
                    lang={lang}
                    onChange={(event) => change({ label: { ...form.label, [lang]: event.target.value } })}
                    value={form.label[lang]}
                  />
                  <DashboardTextField
                    dir="auto"
                    disabled={readOnly}
                    id={`statistic-unit-${lang}`}
                    label={t("unit")}
                    lang={lang}
                    onChange={(event) => change({ unit: { ...form.unit, [lang]: event.target.value } })}
                    value={form.unit[lang]}
                  />
                </>
              )}
            </LocaleFields>
            <PagesPublishCard
              blockers={editing.publish_blockers}
              busy={busy}
              dirty={dirty && !valueInvalid}
              hasDraft={editing.has_unpublished_changes}
              locale={locale}
              onDiscard={() => void run(() => adminDiscardStatisticDraft(editing.id), t("discarded"), t("saveError"))}
              onPublish={() => void run(() => publish(editing), t("published"), t("publishError"))}
              onSave={() => void run(() => adminPatchStatistic(editing.id, bodyOf(form)), t("saved"), t("saveError"))}
              status={editing.status}
            />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
