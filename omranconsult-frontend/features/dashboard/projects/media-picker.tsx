"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { Modal } from "@/features/dashboard/ui/modal";
import { controlLgClass } from "@/features/dashboard/ui/control-styles";
import { adminMedia, adminUploadMedia } from "@/lib/api/admin-browser";

type MediaChoice = {
  id: number;
  url: string;
  original_filename: string | null;
};

export function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaChoice) => void;
}) {
  const t = useTranslations("Dashboard.projects");
  const [items, setItems] = useState<MediaChoice[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handle = window.setTimeout(() => {
      void adminMedia(`?type=image${query ? `&q=${encodeURIComponent(query)}` : ""}`)
        .then((payload) => {
          setItems(payload.data.filter((item) => item.mime_type.startsWith("image/")));
          setError(null);
        })
        .catch(() => setError(t("mediaError")));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [open, query, t]);

  async function upload(file: File | undefined) {
    if (!file) {
      return;
    }
    const uploaded = await adminUploadMedia(file);
    onSelect({ id: uploaded.data.id, url: uploaded.data.url, original_filename: file.name });
    onClose();
  }

  return (
    <Modal
      onClose={onClose}
      open={open}
      title={t("pickMedia")}
    >
      <div className="space-y-3">
        <input aria-label={t("search")} className={controlLgClass} onChange={(event) => setQuery(event.target.value)} value={query} />
        <label className="inline-flex cursor-pointer items-center">
          <span className="text-label-s text-accent">{t("uploadImage")}</span>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => void upload(event.target.files?.[0])}
            type="file"
          />
        </label>
        {error ? <p className="text-caption text-danger">{error}</p> : null}
        <ul className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id}>
              <button aria-label={item.original_filename || t("pickMedia")} className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-line" onClick={() => { onSelect(item); onClose(); }} type="button">
                <Image alt={item.original_filename ?? ""} className="object-cover" fill sizes="120px" src={item.url} />
              </button>
            </li>
          ))}
        </ul>
        <DashboardButton onClick={onClose} type="button" variant="ghost">
          {t("cancel")}
        </DashboardButton>
      </div>
    </Modal>
  );
}
