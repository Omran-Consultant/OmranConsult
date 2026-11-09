"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
import { ApiError } from "@/lib/api/errors";
import {
  adminDeleteMedia,
  adminForceDeleteMedia,
  adminMedia,
  adminMediaItem,
  adminPatchMedia,
  adminUploadMedia,
} from "@/lib/api/admin-browser";

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
    try {
      for (const file of Array.from(files)) {
        await adminUploadMedia(file);
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

  return (
    <div className="space-y-4" data-ready={loaded ? "true" : "false"}>
      <h1 className="font-display text-h3">{t("title")}</h1>
      <div className="flex flex-wrap gap-3">
        <InputField id="media-q" label={t("search")} onChange={(event) => setQ(event.target.value)} value={q} />
        <label className="flex flex-col gap-2.5 text-label-s">
          {t("type")}
          <select className="rounded-md border border-line px-3 py-4" onChange={(event) => setType(event.target.value)} value={type}>
            <option value="">{t("all")}</option>
            <option value="image">{t("images")}</option>
            <option value="pdf">{t("pdfs")}</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-end rounded-md border border-dashed border-line px-4 py-3 text-body-s">
          {t("upload")}
          <input
            className="sr-only"
            multiple
            onChange={(event) => void onFiles(event.target.files)}
            type="file"
          />
        </label>
      </div>
      {error ? <p className="text-danger">{error}</p> : null}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <button className="w-full rounded-xl border border-line p-2 text-start text-caption" onClick={() => void open(item.id)} type="button">
              {item.original_filename ?? item.url}
            </button>
          </li>
        ))}
      </ul>
      {selected ? (
        <aside className="rounded-2xl border border-line p-4" data-media-details="true">
          <h2 className="text-h5">{selected.original_filename ?? selected.url}</h2>
          <p className="text-caption text-muted">{selected.mime_type}</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <InputField id="alt-ar" label={t("altAr")} onChange={(event) => setAltAr(event.target.value)} value={altAr} />
            <InputField id="alt-en" label={t("altEn")} onChange={(event) => setAltEn(event.target.value)} value={altEn} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              onClick={() =>
                void adminPatchMedia(selected.id, { alt: { ar: altAr, en: altEn } }).then(() => open(selected.id))
              }
              type="button"
            >
              {t("save")}
            </Button>
            <Button
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
            </Button>
            <Button
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
            </Button>
          </div>
          <ul className="mt-3 text-caption text-muted">
            {selected.references.map((reference) => (
              <li key={`${reference.type}-${reference.id}`}>
                {reference.type} #{reference.id} ({reference.field})
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </div>
  );
}
