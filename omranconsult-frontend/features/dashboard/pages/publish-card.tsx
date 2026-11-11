"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { pathLabel } from "@/features/dashboard/pages/field-labels";
import { parseFieldPath } from "@/features/dashboard/pages/payload-tree";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { ConfirmDialog } from "@/features/dashboard/ui/confirm-dialog";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import type { AdminPublishBlocker } from "@/lib/api/types";

const BLOCKER_KEYS = {
  dispute_blocks_publish: "blockerDispute",
  headline_ar_required: "blockerHeadlineAr",
  headline_en_required: "blockerHeadlineEn",
  label_ar_required: "blockerLabelAr",
  label_en_required: "blockerLabelEn",
  value_required: "blockerValue",
} as const;

type PublishCardProps = {
  readonly locale: AppLocale;
  readonly status: string;
  readonly hasDraft: boolean;
  readonly blockers: readonly AdminPublishBlocker[];
  readonly dirty: boolean;
  readonly busy: boolean;
  readonly onSave: () => void;
  readonly onPublish: () => void;
  readonly onDiscard: () => void;
};

/** Shared «النشر» card for site-page records: status, blockers, save draft, publish, discard. */
export function PagesPublishCard({ locale, status, hasDraft, blockers, dirty, busy, onSave, onPublish, onDiscard }: PublishCardProps) {
  const t = useTranslations("Dashboard.pages");
  const { can } = useDashboardSession();
  const [confirming, setConfirming] = useState(false);
  const canUpdate = can("content.pages.update");
  const canPublish = can("content.pages.publish");
  const blocked = blockers.length > 0 && !dirty;
  // Nothing to publish while the live version is the only version.
  const nothingToPublish = status === "published" && !hasDraft && !dirty;

  function blockerText(blocker: AdminPublishBlocker): string {
    if (blocker.code === "translation_missing") {
      return t("blockerTranslation", { field: pathLabel(parseFieldPath(blocker.field), locale) });
    }
    return t(BLOCKER_KEYS[blocker.code as keyof typeof BLOCKER_KEYS] ?? "publishBlocked");
  }

  return (
    <section className="space-y-3 rounded-2xl border border-line bg-elevated p-5" data-publish-card="">
      <h2 className="text-h5">{t("publishCard")}</h2>
      <StatusPill locale={locale} status={status} />
      {hasDraft || dirty ? <p className="text-caption text-muted">{dirty ? t("unsaved") : t("liveNote")}</p> : null}
      {blockers.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-danger/30 bg-danger/5 p-3 text-caption text-danger" data-publish-blockers="">
          {blockers.map((blocker) => (
            <li key={`${blocker.field}-${blocker.code}`}>{blockerText(blocker)}</li>
          ))}
        </ul>
      ) : null}
      {canUpdate ? (
        <DashboardButton className="w-full" disabled={!dirty} loading={busy} onClick={onSave} variant="secondary">
          {t("save")}
        </DashboardButton>
      ) : null}
      {canPublish ? (
        <DashboardButton
          className="w-full"
          disabled={blocked || nothingToPublish || busy}
          disabledReason={blocked ? t("publishBlocked") : undefined}
          onClick={onPublish}
        >
          {t("publish")}
        </DashboardButton>
      ) : null}
      {canUpdate && hasDraft ? (
        <DashboardButton className="w-full" disabled={busy} onClick={() => setConfirming(true)} variant="ghost">
          {t("discard")}
        </DashboardButton>
      ) : null}
      <ConfirmDialog
        cancelLabel={t("cancel")}
        confirmLabel={t("discard")}
        destructive
        message={t("discardMessage")}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDiscard();
        }}
        open={confirming}
        title={t("discardTitle")}
      />
    </section>
  );
}
