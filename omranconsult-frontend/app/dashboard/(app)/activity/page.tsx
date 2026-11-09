"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { activitySentence, prepareActivityFeed } from "@/features/dashboard/home/activity-feed";
import { labelAuditAction } from "@/features/dashboard/labels";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardSwitch, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { Avatar } from "@/features/dashboard/ui/avatar";
import type { AppLocale } from "@/i18n/routing";
import { adminAuditLogs } from "@/lib/api/admin-browser";

export default function ActivityPage() {
  const t = useTranslations("Dashboard.activity");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [rows, setRows] = useState<
    { id: number; action: string; occurred_at: string; subject_type: string | null; user: { name: string } | null }[]
  >([]);
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showLogins, setShowLogins] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const query = new URLSearchParams();
    if (action) {
      query.set("action", action);
    }
    if (from) {
      query.set("from", from);
    }
    if (to) {
      query.set("to", to);
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    void adminAuditLogs(suffix).then((payload) => {
      setRows(payload.data);
      setLoaded(true);
    });
  }, [action, from, to]);

  const grouped = useMemo(
    () =>
      prepareActivityFeed(
        rows.map((row) => ({
          id: row.id,
          action: row.action,
          occurred_at: row.occurred_at,
          user_id: null,
          user_name: row.user?.name ?? null,
        })),
        { includeLogins: showLogins },
      ),
    [rows, showLogins],
  );

  return (
    <div className="space-y-4" data-ready={loaded ? "true" : "false"}>
      <PageHeader
        actions={
          <DashboardSwitch compact id="activity-logins" label={t("showLogins")} checked={showLogins} onChange={setShowLogins} />
        }
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardTextField id="audit-action" label={t("action")} onChange={(event) => setAction(event.target.value)} value={action} />
        <DashboardTextField id="audit-from" label={t("from")} onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
        <DashboardTextField id="audit-to" label={t("to")} onChange={(event) => setTo(event.target.value)} type="date" value={to} />
      </div>
      {grouped.length === 0 ? (
        <p className="text-body-s text-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-elevated">
          {grouped.map((row) => (
            <li className="flex items-center justify-between gap-3 px-4 py-3 text-body-s" key={row.id}>
              <span className="flex min-w-0 items-center gap-2">
                <Avatar name={row.user_name ?? row.action} />
                <span className="truncate">{activitySentence(row, labelAuditAction(row.action, locale), locale)}</span>
              </span>
              <RelativeTime className="shrink-0 text-caption text-muted" locale={locale} value={row.occurred_at} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
