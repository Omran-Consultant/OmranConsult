"use client";

import { useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import { Icon } from "@/core/ui/icon";

const CIRCLE =
  "flex size-11 items-center justify-center rounded-full border border-line-strong font-latin text-label-s text-primary transition-colors duration-150 hover:border-accent hover:text-accent";

const subscribeNever = () => () => {};

type ShareLinksProps = {
  readonly title: string;
  /** Absolute article URL when NEXT_PUBLIC_SITE_URL is set; otherwise the current address is used. */
  readonly url?: string;
};

/** Plain share URLs (X, LinkedIn, WhatsApp) and copy link; no third-party scripts (FIGMA §6.7). */
export function ShareLinks({ title, url }: ShareLinksProps) {
  const t = useTranslations("MediaPage.article");
  const currentHref = useSyncExternalStore(subscribeNever, () => window.location.href, () => "");
  const href = url ?? currentHref;
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const encodedUrl = encodeURIComponent(href);
  const links = [
    { label: t("shareX"), glyph: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}` },
    { label: t("shareLinkedIn"), glyph: "in", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: t("shareWhatsApp"), glyph: "WA", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${href}`)}` },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(href || window.location.href);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-caption text-muted">{t("share")}</span>
      {links.map((link) => (
        <a className={CIRCLE} href={link.href} key={link.glyph} rel="noopener noreferrer" target="_blank">
          <span aria-hidden="true">{link.glyph}</span>
          <span className="sr-only">{link.label}</span>
        </a>
      ))}
      <button aria-label={t("copyLink")} className={CIRCLE} onClick={copy} type="button">
        <Icon name={status === "copied" ? "check" : "link"} />
      </button>
      <span aria-live="polite" className="text-caption text-accent empty:hidden">
        {status === "copied" ? t("copied") : status === "failed" ? t("copyFailed") : null}
      </span>
    </div>
  );
}
