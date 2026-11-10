"use client";

import Image from "next/image";

import { Icon } from "@/core/ui/icon";
import { dashboardCoverSrc } from "@/features/dashboard/projects/cover-image";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";

export function CoverField({
  url,
  mediaKey,
  alt,
  onChange,
  onRemove,
  changeLabel,
  removeLabel,
  emptyLabel,
  fallbackAlt,
}: {
  url?: string | null;
  mediaKey?: string | null;
  alt?: string | null;
  onChange: () => void;
  onRemove: () => void;
  changeLabel: string;
  removeLabel: string;
  emptyLabel: string;
  fallbackAlt: string;
}) {
  const src = url || dashboardCoverSrc(mediaKey);
  const caption = alt?.trim() || (src ? fallbackAlt : null);

  if (!src) {
    return (
      <div className="space-y-2" data-cover-field="empty">
        <div className="grid aspect-[16/10] place-items-center rounded-xl border border-dashed border-line bg-highlight text-muted">
          <Icon name="image" />
        </div>
        <DashboardButton onClick={onChange} type="button" variant="secondary">
          {emptyLabel}
        </DashboardButton>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-cover-field="set">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-highlight">
        <Image alt={caption || ""} className="object-cover" fill sizes="352px" src={src} />
      </div>
      {caption ? <p className="text-caption text-secondary">{caption}</p> : null}
      <div className="flex flex-wrap gap-2">
        <DashboardButton onClick={onChange} type="button" variant="secondary">
          {changeLabel}
        </DashboardButton>
        <DashboardButton onClick={onRemove} type="button" variant="ghost">
          {removeLabel}
        </DashboardButton>
      </div>
    </div>
  );
}
