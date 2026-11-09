"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
import { DashboardTextField, DashboardSelect } from "@/features/dashboard/ui/dashboard-field";
import { Drawer } from "@/features/dashboard/ui/drawer";
import { FileDrop } from "@/features/dashboard/ui/file-drop";
import { PageHeader } from "@/features/dashboard/ui/page-header";

type MediaRow = {
  id: number;
  url: string;
  original_filename: string | null;
  mime_type: string;
};

type MediaDetail = MediaRow & {
  alt: { ar?: string | null; en?: string | null } | null;
  caption: { ar?: string | null; en?: string | null } | null;
  references: { type: string; id: number; field: string }[];
};

type UploadJob = { name: string; done: boolean };

export default function MediaPage() {
  const t = useTranslations("Dashboard.media");
  const [items, setItems] = useState<MediaRow[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelected] = useState<MediaDetail | null>(null);
  const [altAr, setAltAr] = useState("");
  const [altEn, setAltEn] = useState("");
  const [uploads, setUploads] = useState<UploadJob[]>([]);

  async function load(search = q, kind = type) {
    const query = new URLSearchParams();
    if (search) {
      query.set("q", search);
    }
    if (kind) {
      query.set("type", kind);
    }
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const payload = await adminMedia(suffix);
    setItems(payload.data);
    setLoaded(true);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const query = new URLSearchParams();
      if (q) {
        query.set("q", q);
      }
      if (type) {
        query.set("type", type);
      }
      const suffix = query.toString() ? `?${query.toString()}` : "";
      void adminMedia(suffix).then((payload) => {
        setItems(payload.data);
        setLoaded(true);
      });
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
      <div className="flex flex-wrap items-end gap-3">
        <DashboardTextField id="media-q" label={t("search")} onChange={(event) => setQ(event.target.value)} value={q} />
        <DashboardSelect id="media-type" label={t("type")} onChange={(event) => setType(event.target.value)} value={type}>
          <option value="">{t("all")}</option>
          <option value="image">{t("images")}</option>
          <option value="pdf">{t("pdfs")}</option>
        </DashboardSelect>
      </div>
      <FileDrop hint={t("upload")} label={t("upload")} onFiles={(files) => void onFiles(files)} />
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
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <button
              className="w-full rounded-xl border border-line p-2 text-start text-caption"
              data-media-item
              onClick={() => void open(item.id)}
              type="button"
            >
              {item.original_filename ?? item.url}
            </button>
          </li>
        ))}
      </ul>
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
