"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { pathPattern, TreeChildren, type TreeContext } from "@/features/dashboard/pages/block-tree-editor";
import { PAGE_PATHS, pageLabel, sectionLabel } from "@/features/dashboard/pages/field-labels";
import {
  completeness,
  isLongText,
  isRecord,
  isTranslationMap,
  setAtPath,
  type EditorLocale,
  type PayloadNode,
  type PayloadPath,
} from "@/features/dashboard/pages/payload-tree";
import { PagesPublishCard } from "@/features/dashboard/pages/publish-card";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { StatusPill } from "@/features/dashboard/ui/status-pill";
import { DashboardTabs } from "@/features/dashboard/ui/tabs";
import { useDashboardToast } from "@/features/dashboard/ui/toast";
import type { AppLocale } from "@/i18n/routing";
import { adminDiscardPageBlockDraft, adminPageBlock, adminPatchPageBlock, adminPublishPageBlock } from "@/lib/api/admin-browser";
import type { AdminPageBlockDetail } from "@/lib/api/types";

/** Path patterns whose loaded text is long in either language: those stay textareas while typing. */
function collectLongPatterns(node: PayloadNode, path: PayloadPath, into: Set<string>): Set<string> {
  if (isTranslationMap(node)) {
    if (isLongText(node)) {
      into.add(pathPattern(path));
    }
    return into;
  }
  if (Array.isArray(node)) {
    node.forEach((child, index) => collectLongPatterns(child, [...path, index], into));
  } else if (isRecord(node)) {
    Object.entries(node).forEach(([key, child]) => collectLongPatterns(child, [...path, key], into));
  }
  return into;
}

export default function PageBlockEditorPage() {
  const t = useTranslations("Dashboard.pages");
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const { can } = useDashboardSession();
  const pushToast = useDashboardToast();
  const [detail, setDetail] = useState<AdminPageBlockDetail | null>(null);
  const [payload, setPayload] = useState<PayloadNode>(null);
  const [lang, setLang] = useState<EditorLocale>("ar");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function apply(next: AdminPageBlockDetail) {
    setDetail(next);
    setPayload((next.draft ?? next.payload) as PayloadNode);
    setDirty(false);
    setError(null);
  }

  useEffect(() => {
    void adminPageBlock(id)
      .then(apply)
      .catch(() => setLoadError(true));
  }, [id]);

  useEffect(() => {
    if (!dirty) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Decided once per loaded record, so a field does not switch between input and textarea while typing.
  const longPatterns = useMemo(
    () => collectLongPatterns((detail?.draft ?? detail?.payload ?? null) as PayloadNode, [], new Set<string>()),
    [detail],
  );

  if (loadError) {
    return (
      <p className="rounded-2xl border border-danger/30 bg-danger/5 p-5 text-body-s text-danger" data-ready="true">
        {t("loadError")}
      </p>
    );
  }
  if (!detail) {
    return (
      <p className="text-muted" data-ready="false">
        {t("loading")}
      </p>
    );
  }

  async function run(action: () => Promise<AdminPageBlockDetail>, done: string, failed: string) {
    setBusy(true);
    try {
      apply(await action());
      pushToast(done);
    } catch {
      setError(failed);
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    try {
      let current = detail;
      if (dirty && current) {
        current = await adminPatchPageBlock(id, payload);
        apply(current);
      }
      if (current && current.publish_blockers.length > 0) {
        setError(t("publishBlocked"));
        return;
      }
      apply(await adminPublishPageBlock(id));
      pushToast(t("published"));
    } catch {
      setError(t("publishError"));
    } finally {
      setBusy(false);
    }
  }

  const ctx: TreeContext = {
    locale,
    lang,
    icons: detail.icons,
    longPatterns,
    readOnly: !can("content.pages.update"),
    onChange: (path, value) => {
      setPayload((current) => setAtPath(current, path, value));
      setDirty(true);
    },
  };
  const counts = { ar: completeness(payload, "ar"), en: completeness(payload, "en") };
  const publicPath = `/${locale}${PAGE_PATHS[detail.page] ?? ""}`;

  return (
    <div className="space-y-6" data-ready="true">
      <PageHeader
        actions={<StatusPill locale={locale} status={detail.status} />}
        breadcrumbs={
          <Link className="text-accent hover:underline" href="/dashboard/pages">
            {t("back")}
          </Link>
        }
        subtitle={pageLabel(detail.page, locale)}
        title={sectionLabel(detail.section_key, locale)}
      />
      {error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/5 p-3 text-body-s text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="min-w-0 space-y-4 rounded-2xl border border-line bg-elevated p-5">
          <h2 className="text-h5">{t("contentCard")}</h2>
          <DashboardTabs
            active={lang}
            onChange={(tab) => setLang(tab as EditorLocale)}
            tabs={[
              // Isolates keep «English» and the Arabic count from reordering each other.
              { id: "ar", label: `\u2068${t("localeAr")}\u2069 · \u2068${t("completeness", counts.ar)}\u2069` },
              { id: "en", label: `\u2068${t("localeEn")}\u2069 · \u2068${t("completeness", counts.en)}\u2069` },
            ]}
          />
          <p className="text-caption text-muted">{t("accentHint", { open: "{accent}", close: "{/accent}" })}</p>
          <div className="min-w-0 space-y-4" data-block-tree="">
            <TreeChildren ctx={ctx} node={payload} path={[]} />
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <PagesPublishCard
            blockers={detail.publish_blockers}
            busy={busy}
            dirty={dirty}
            hasDraft={detail.has_unpublished_changes}
            locale={locale}
            onDiscard={() => void run(() => adminDiscardPageBlockDraft(id), t("discarded"), t("saveError"))}
            onPublish={() => void publish()}
            onSave={() => void run(() => adminPatchPageBlock(id, payload), t("saved"), t("saveError"))}
            status={detail.status}
          />
          <a className="block text-body-s text-accent hover:underline" href={publicPath} rel="noopener noreferrer" target="_blank">
            {t("viewPage")}
          </a>
        </aside>
      </div>
    </div>
  );
}
