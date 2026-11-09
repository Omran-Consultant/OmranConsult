"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { ApiError } from "@/lib/api/errors";
import {
  adminDeleteMedia,
  adminForceDeleteMedia,
  adminMedia,
  adminMediaItem,
  adminPatchMedia,
  adminUploadMedia,
} from "@/lib/api/admin-browser";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { controlMdClass, controlRowClass } from "@/features/dashboard/ui/control-styles";
import { Drawer } from "@/features/dashboard/ui/drawer";
import { FileDrop } from "@/features/dashboard/ui/file-drop";
import { PageHeader } from "@/features/dashboard/ui/page-header";

type MediaRow = {
  id: number;
  url: string;
  path: string;
  original_filename: string | null;
  mime_type: string;
  size_bytes: number | null;
  references: { type: string; id: number; field: string }[];
};

function mediaThumb(item: MediaRow): string {
  if (item.path) {
    return `/${item.path.replace(/^\//, "")}`;
  }
  return item.url;
}

function formatBytes(bytes: number | null, locale: string): string {
  if (!bytes || bytes <= 0) {
    return "";
  }
  const units = ["B", "KB", "MB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-SA-u-nu-latn" : "en-GB", {
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
  return `${formatted} ${units[unit]}`;
}

function typeBadge(mime: string): string {
  if (mime === "application/pdf") {
    return "PDF";
  }
  if (mime.startsWith("image/")) {
    return mime.replace("image/", "").toUpperCase();
  }
  return mime;
}

type MediaDetail = MediaRow & {
  alt: { ar?: string | null; en?: string | null } | null;
  caption: { ar?: string | null; en?: string | null } | null;
  references: { type: string; id: number; field: string }[];
};

type UploadJob = { name: string; done: boolean };

export default function MediaPage() {
  const t = useTranslations("Dashboard.media");
  const locale = readDashboardLocaleFromDocument();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<MediaDetail | null>(null);
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");
  const [uploads, setUploads] = useState<UploadJob[]>([]);

  async function fetchPage(nextPage: number, search = q, kind = type, append = false) {
    const query = new URLSearchParams();
    if (search) {
      query.set("q", search);
    }
    if (kind) {
      query.set("type", kind);
    }
    query.set("page", String(nextPage));
    const payload = await adminMedia(`?${query.toString()}`);
    setItems((current) => (append ? [...current, ...payload.data] : payload.data));
    setPage(payload.meta.current_page);
    setLastPage(payload.meta.last_page);
    setLoaded(true);
  }

  async function load(search = q, kind = type) {
    await fetchPage(1, search, kind, false);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetchPage(1, q, type, false);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q, type]);

  async function onFiles(files: FileList | null) {
    if (!files) {
      return;
    }
    setError(null);
    const jobs = Array.from(files).map((file) => ({ name: file.name, done: false }));
    setUploads(jobs);
    try {
      for (const [index, file] of Array.from(files).entries()) {
        await adminUploadMedia(file);
        setUploads((current) => current.map((job, jobIndex) => (jobIndex === index ? { ...job, done: true } : job)));
      }
      await load();
    } catch (caught) {
      const code = caught instanceof ApiError ? caught.errors?.file?.[0] : undefined;
      setError(code === "svg_not_allowed" || code === "mime_mismatch" ? t("svgRejected") : t("uploadFailed"));
    }
  }

  async function open(id: number) {
    const payload = await adminMediaItem(id);
    setSelected(payload.data);
    setAltAr(payload.data.alt?.ar ?? "");
    setAltEn(payload.data.alt?.en ?? "");
  }

  const doneCount = uploads.filter((job) => job.done).length;

  return (
    <div className="space-y-4" data-ready={loaded ? "true" : "false"}>
      <PageHeader subtitle={t("subtitle")} title={t("title")} />
      <div className={controlRowClass} data-dashboard-toolbar>
        <input
          aria-label={t("search")}
          className={`${controlMdClass} w-[22.5rem] max-w-full px-4`}
          onChange={(event) => setQ(event.target.value)}
          placeholder={t("search")}
          type="search"
          value={q}
        />
        <select
          aria-label={t("type")}
          className={`${controlMdClass} w-40`}
          onChange={(event) => setType(event.target.value)}
          value={type}
        >
          <option value="">{t("all")}</option>
          <option value="image">{t("images")}</option>
          <option value="pdf">{t("pdfs")}</option>
        </select>
      </div>
      <FileDrop
        buttonLabel={t("chooseFiles")}
        hint={t("uploadHelper")}
        label={t("uploadTitle")}
        onFiles={(files) => void onFiles(files)}
      />
      {uploads.length > 0 ? (
        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-body-s">{t("uploadedCount", { done: doneCount, total: uploads.length })}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-highlight">
            <div className="h-full bg-accent-strong" style={{ width: `${uploads.length === 0 ? 0 : (doneCount / uploads.length) * 100}%` }} />
          </div>
          <ul className="mt-2 text-caption text-muted">
            {uploads.map((job) => (
              <li key={job.name}>{job.done ? job.name : t("uploading", { name: job.name })}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {error ? <p className="text-danger">{error}</p> : null}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const name = item.original_filename ?? item.path;
          const used = item.references.length;
          const image = item.mime_type.startsWith("image/");
          return (
            <li key={item.id}>
              <button
                className="flex w-full flex-col overflow-hidden rounded-xl border border-line bg-elevated text-start"
                data-media-item
                onClick={() => void open(item.id)}
                type="button"
              >
                <span className="grid aspect-video place-items-center bg-highlight">
                  {image ? (
                    // Dashboard library thumbs are untrusted CMS URLs; a plain img avoids next/image remote config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="size-full object-cover" src={mediaThumb(item)} />
                  ) : (
                    <span className="text-caption text-muted">{typeBadge(item.mime_type)}</span>
                  )}
                </span>
                <span className="flex flex-col gap-1 p-2">
                  <span className="truncate text-caption font-medium">{name}</span>
                  <span className="flex flex-wrap gap-1">
                    <span className="rounded-full bg-highlight px-2 py-0.5 text-[11px] text-secondary">
                      {typeBadge(item.mime_type)}
                      {item.size_bytes ? ` · ${formatBytes(item.size_bytes, locale)}` : ""}
                    </span>
                    {used > 0 ? (
                      <span className="rounded-full bg-tint px-2 py-0.5 text-[11px] text-accent">{t("usedIn", { n: used })}</span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {page < lastPage ? (
        <DashboardButton onClick={() => void fetchPage(page + 1, q, type, true)} type="button" variant="secondary">
          {t("loadMore")}
        </DashboardButton>
      ) : null}
      <Drawer onClose={() => setSelected(null)} open={Boolean(selected)} title={t("details")}>
        {selected ? (
          <div data-media-details="true">
            <h2 className="text-h5">{selected.original_filename ?? selected.url}</h2>
            <p className="text-caption text-muted">{selected.mime_type}</p>
            <div className="mt-3 grid gap-3">
              <DashboardTextField id="alt-ar" label={t("altAr")} onChange={(event) => setAltAr(event.target.value)} value={altAr} />
              <DashboardTextField id="alt-en" label={t("altEn")} onChange={(event) => setAltEn(event.target.value)} value={altEn} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <DashboardButton
                onClick={() =>
                  void adminPatchMedia(selected.id, { alt: { ar: altAr, en: altEn } }).then(() => open(selected.id))
                }
                type="button"
              >
                {t("save")}
              </DashboardButton>
              <DashboardButton
                onClick={() =>
                  void adminDeleteMedia(selected.id)
                    .then(() => {
                      setSelected(null);
                      return load();
                    })
                    .catch(() => setError(t("inUse")))
                }
                type="button"
                variant="ghost"
              >
                {t("delete")}
              </DashboardButton>
              <DashboardButton
                onClick={() =>
                  void adminForceDeleteMedia(selected.id).then(() => {
                    setSelected(null);
                    return load();
                  })
                }
                type="button"
                variant="ghost"
              >
                {t("forceDelete")}
              </DashboardButton>
            </div>
            <ul className="mt-3 text-caption text-muted">
              {selected.references.map((reference) => (
                <li key={`${reference.type}-${reference.id}`}>
                  {reference.type} #{reference.id} ({reference.field})
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
