"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { labelAuditAction } from "@/features/dashboard/labels";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import type { AppLocale } from "@/i18n/routing";
import { adminAuditLogs } from "@/lib/api/admin-browser";

export default function ActivityPage() {
  const t = useTranslations("Dashboard.activity");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [rows, setRows] = useState<{ id: number; action: string; occurred_at: string; subject_type: string | null; user: { name: string } | null }[]>([]);
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
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

  return (
    <div className="space-y-4" data-ready={loaded ? "true" : "false"}>
      <h1 className="font-display text-h3">{t("title")}</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <DashboardTextField id="audit-action" label={t("action")} onChange={(event) => setAction(event.target.value)} value={action} />
        <DashboardTextField id="audit-from" label={t("from")} onChange={(event) => setFrom(event.target.value)} type="date" value={from} />
        <DashboardTextField id="audit-to" label={t("to")} onChange={(event) => setTo(event.target.value)} type="date" value={to} />
      </div>
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {rows.map((row) => (
          <li className="px-4 py-3 text-body-s" key={row.id}>
            <span className="font-medium">{labelAuditAction(row.action, locale)}</span>
            <span className="ms-2 text-muted">{row.user?.name}</span>
            <RelativeTime className="ms-2 text-caption text-muted" locale={locale} value={row.occurred_at} />
          </li>
        ))}
      </ul>
    </div>
  );
}
