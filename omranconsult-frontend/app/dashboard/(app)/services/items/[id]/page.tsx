"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import type { AppLocale } from "@/i18n/routing";
import { adminPatchServiceItem, adminPublishServiceItem, adminServiceItem } from "@/lib/api/admin-browser";
import type { AdminServiceItemDetail } from "@/lib/api/types";

const BLOCKER_KEYS: Record<string, "blockerTitleAr" | "blockerTitleEn" | "blockerSlug" | "blockerCategory" | "blockerDispute" | "publishBlocked"> = {
  title_ar_required: "blockerTitleAr",
  title_en_required: "blockerTitleEn",
  slug_required: "blockerSlug",
  category_required: "blockerCategory",
  dispute_blocks_publish: "blockerDispute",
};

export default function ServiceItemEditorPage() {
  const t = useTranslations("Dashboard.services");
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const [detail, setDetail] = useState<AdminServiceItemDetail | null>(null);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void adminServiceItem(id).then((payload) => {
      setDetail(payload);
      const source = payload.draft ?? payload;
      const title = (source.title as { ar?: string; en?: string } | undefined) ?? payload.title;
      setTitleAr(title?.ar ?? "");
      setTitleEn(title?.en ?? "");
      setSlug(typeof source.slug === "string" ? source.slug : payload.slug);
    });
  }, [id]);

  if (!detail) {
    return <p className="text-muted" data-ready="false">{t("loading")}</p>;
  }

  async function save() {
    const next = await adminPatchServiceItem(id, { title: { ar: titleAr, en: titleEn }, slug });
    setDetail(next);
    setMessage(t("saved"));
    return next;
  }

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={<StatusPill locale={locale} status={detail.has_unpublished_changes ? "published_with_draft" : detail.status} />}
        subtitle={t("subtitle")}
        title={titleAr || titleEn || t("editItem")}
      />
      {message ? <p className="text-accent">{message}</p> : null}
      {detail.publish_blockers.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-danger/30 bg-danger/5 p-3 text-caption text-danger">
          {detail.publish_blockers.map((item) => (
            <li key={item.code}>{t(BLOCKER_KEYS[item.code] ?? "publishBlocked")}</li>
          ))}
        </ul>
      ) : null}
      <section className="grid max-w-3xl gap-4 rounded-2xl border border-line bg-elevated p-5">
        <DashboardTextField id="title-ar" label={t("titleAr")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
        <DashboardTextField id="title-en" label={t("titleEn")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
        <DashboardTextField dir="ltr" id="slug" label={t("slug")} onChange={(event) => setSlug(event.target.value)} spellCheck={false} value={slug} />
        <div className="flex flex-wrap gap-2">
          <DashboardButton onClick={() => void save()} type="button" variant="secondary">
            {t("save")}
          </DashboardButton>
          <DashboardButton
            disabled={detail.publish_blockers.length > 0}
            disabledReason={detail.publish_blockers.length > 0 ? t("publishBlocked") : undefined}
            onClick={() => void save().then((saved) => adminPublishServiceItem(saved.id).then(setDetail))}
            type="button"
          >
            {t("publish")}
          </DashboardButton>
        </div>
      </section>
    </div>
  );
}
