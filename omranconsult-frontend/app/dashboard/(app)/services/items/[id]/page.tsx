"use client";

import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
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
  const [langTab, setLangTab] = useState<"ar" | "en">("ar");
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

  const publishDisabled = detail.publish_blockers.length > 0;

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={<StatusPill locale={locale} status={detail.has_unpublished_changes ? "published_with_draft" : detail.status} />}
        subtitle={t("subtitle")}
        title={titleAr || titleEn || t("editItem")}
      />
      {message ? <p className="text-accent">{message}</p> : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("contentCard")}</h2>
            <DashboardTabs
              active={langTab}
              onChange={(tab) => setLangTab(tab as "ar" | "en")}
              tabs={[
                { id: "ar", label: t("localeAr") },
                { id: "en", label: t("localeEn") },
              ]}
            />
            <div className="mt-4 space-y-4">
              <div className={langTab === "ar" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-ar" label={t("titleLabel")} onChange={(event) => setTitleAr(event.target.value)} value={titleAr} />
              </div>
              <div className={langTab === "en" ? "space-y-4" : "hidden space-y-4"}>
                <DashboardTextField id="title-en" label={t("titleLabel")} onChange={(event) => setTitleEn(event.target.value)} value={titleEn} />
              </div>
              <DashboardTextField dir="ltr" id="slug" label={t("slug")} onChange={(event) => setSlug(event.target.value)} spellCheck={false} value={slug} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-elevated p-5">
            <h2 className="mb-4 text-h5">{t("publishCard")}</h2>
            <div className="space-y-3">
              <StatusPill locale={locale} status={detail.has_unpublished_changes ? "published_with_draft" : detail.status} />
              {detail.publish_blockers.length > 0 ? (
                <ul className="space-y-1 rounded-xl border border-danger/30 bg-danger/5 p-3 text-caption text-danger">
                  {detail.publish_blockers.map((item) => (
                    <li key={item.code}>{t(BLOCKER_KEYS[item.code] ?? "publishBlocked")}</li>
                  ))}
                </ul>
              ) : null}
              <DashboardButton onClick={() => void save()} type="button" variant="secondary">
                {t("save")}
              </DashboardButton>
              <DashboardButton
                className={publishDisabled ? "opacity-50 grayscale" : undefined}
                disabled={publishDisabled}
                disabledReason={publishDisabled ? t("publishBlocked") : undefined}
                onClick={() => void save().then((saved) => adminPublishServiceItem(saved.id).then(setDetail))}
                type="button"
              >
                {t("publish")}
              </DashboardButton>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
