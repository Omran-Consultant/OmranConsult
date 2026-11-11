"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { slideLabel } from "@/features/dashboard/pages/field-labels";
import { LocaleFields } from "@/features/dashboard/pages/locale-fields";
import { PagesPublishCard } from "@/features/dashboard/pages/publish-card";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { DashboardTextField, DashboardTextarea } from "@/features/dashboard/ui/dashboard-field";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { Drawer } from "@/features/dashboard/ui/drawer";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { useDashboardToast } from "@/features/dashboard/ui/toast";
import type { AppLocale } from "@/i18n/routing";
import { adminDiscardHeroSlideDraft, adminHeroSlides, adminPatchHeroSlide, adminPublishHeroSlide } from "@/lib/api/admin-browser";
import type { AdminHeroSlide, AdminLocaleText } from "@/lib/api/types";

type SlideForm = { headline: { ar: string; en: string }; subline: { ar: string; en: string } };

function text(value: AdminLocaleText | null | undefined): { ar: string; en: string } {
  return { ar: value?.ar ?? "", en: value?.en ?? "" };
}

function formOf(slide: AdminHeroSlide): SlideForm {
  return { headline: text(slide.draft?.headline ?? slide.headline), subline: text(slide.draft?.subline ?? slide.subline) };
}

/** Hero slides and section dividers: headline and subline in both languages. */
export function HeroSlidesTab({ locale }: { readonly locale: AppLocale }) {
  const t = useTranslations("Dashboard.pages");
  const { can } = useDashboardSession();
  const pushToast = useDashboardToast();
  const [slides, setSlides] = useState<AdminHeroSlide[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SlideForm | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readOnly = !can("content.pages.update");

  function load() {
    void adminHeroSlides()
      .then((response) => setSlides(response.data))
      .catch(() => setFailed(true));
  }

  useEffect(load, []);

  function retry() {
    setFailed(false);
    load();
  }

  const editing = slides?.find((slide) => slide.id === editingId) ?? null;

  function open(slide: AdminHeroSlide) {
    setEditingId(slide.id);
    setForm(formOf(slide));
    setDirty(false);
    setError(null);
  }

  function replace(next: AdminHeroSlide) {
    setSlides((current) => current?.map((slide) => (slide.id === next.id ? next : slide)) ?? null);
    setForm(formOf(next));
    setDirty(false);
    setError(null);
  }

  async function run(action: () => Promise<AdminHeroSlide | null>, done: string, failedMessage: string) {
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

  async function publish(slide: AdminHeroSlide): Promise<AdminHeroSlide | null> {
    let current = slide;
    if (dirty && form) {
      current = await adminPatchHeroSlide(slide.id, form);
      replace(current);
    }
    if (current.publish_blockers.length > 0) {
      setError(t("publishBlocked"));
      return null;
    }
    return adminPublishHeroSlide(slide.id);
  }

  function field(group: keyof SlideForm, lang: "ar" | "en", value: string) {
    setForm((current) => (current ? { ...current, [group]: { ...current[group], [lang]: value } } : current));
    setDirty(true);
  }

  const pickText = (value: AdminLocaleText | null) => (locale === "ar" ? value?.ar : value?.en) || "—";

  return (
    <div className="space-y-4" data-ready={slides || failed ? "true" : "false"}>
      <p className="text-body-s text-secondary">{t("slidesIntro")}</p>
      <DataTable
        columns={[
          { id: "slide", header: t("colSlide"), width: "22%", cell: (row) => <span className="font-medium">{slideLabel(row.key, locale)}</span> },
          { id: "headline", header: t("colHeadline"), width: "28%", cell: (row) => <span className="line-clamp-2">{pickText(row.headline)}</span> },
          { id: "subline", header: t("colSubline"), cell: (row) => <span className="line-clamp-2 text-secondary">{pickText(row.subline)}</span> },
          { id: "status", header: t("colStatus"), width: "11rem", cell: (row) => <StatusPill locale={locale} status={row.status} /> },
        ]}
        actionsWidth="4.5rem"
        emptyTitle={t("empty")}
        error={failed ? t("loadError") : null}
        loading={!slides && !failed}
        mobileCard={(row) => (
          <button
            className="block w-full rounded-2xl border border-line bg-elevated p-4 text-start"
            data-slide-key={row.key}
            key={row.id}
            onClick={() => open(row)}
            type="button"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-medium">{slideLabel(row.key, locale)}</span>
              <StatusPill locale={locale} status={row.status} />
            </span>
            <span className="mt-2 block text-body-s">{pickText(row.headline)}</span>
            <span className="block text-caption text-secondary">{pickText(row.subline)}</span>
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
        rows={slides ?? []}
      />

      <Drawer onClose={() => setEditingId(null)} open={Boolean(editing && form)} title={editing ? `${t("editSlide")}: ${slideLabel(editing.key, locale)}` : ""}>
        {editing && form ? (
          <div className="space-y-5" data-slide-editor={editing.key}>
            {error ? (
              <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-body-s text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <LocaleFields>
              {(lang) => (
                <>
                  <DashboardTextField
                    dir="auto"
                    disabled={readOnly}
                    id={`slide-headline-${lang}`}
                    label={t("headline")}
                    lang={lang}
                    onChange={(event) => field("headline", lang, event.target.value)}
                    value={form.headline[lang]}
                  />
                  <DashboardTextarea
                    dir="auto"
                    disabled={readOnly}
                    id={`slide-subline-${lang}`}
                    label={t("subline")}
                    lang={lang}
                    onChange={(event) => field("subline", lang, event.target.value)}
                    rows={3}
                    value={form.subline[lang]}
                  />
                </>
              )}
            </LocaleFields>
            <PagesPublishCard
              blockers={editing.publish_blockers}
              busy={busy}
              dirty={dirty}
              hasDraft={editing.has_unpublished_changes}
              locale={locale}
              onDiscard={() => void run(() => adminDiscardHeroSlideDraft(editing.id), t("discarded"), t("saveError"))}
              onPublish={() => void run(() => publish(editing), t("published"), t("publishError"))}
              onSave={() => void run(() => adminPatchHeroSlide(editing.id, form), t("saved"), t("saveError"))}
              status={editing.status}
            />
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
