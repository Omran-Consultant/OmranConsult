"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useRef, type ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import type { CredentialScan } from "@/features/media/credential-scans";
import { showModalFrom } from "@/core/ui/show-modal";

type CertificateCardProps = {
  /** Latin code or name, for example "ISO 9001". */
  readonly code?: string;
  readonly label?: string;
  readonly badge?: ReactNode;
  /** Profile scan. Absent documents keep the seal ring. */
  readonly image?: CredentialScan;
  readonly className?: string;
};

/** Trust card. A scan sits on a light panel and opens at its own size; otherwise the seal ring. */
export function CertificateCard({ code, label, badge, image, className }: CertificateCardProps) {
  if (!image) {
    return (
      <div className={classNames("glass flex h-full flex-col items-center gap-2 rounded-lg border border-line px-4 py-7 text-center", className)}>
        <span aria-hidden="true" className="mb-1 size-11 rounded-full border-[1.5px] border-accent" />
        <CardText code={code} label={label} />
        {badge}
      </div>
    );
  }

  return <ScanCard badge={badge} className={className} code={code} image={image} label={label} />;
}

function ScanCard({ code, label, badge, image, className }: CertificateCardProps & { readonly image: CredentialScan }) {
  const t = useTranslations("Credentials");
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className={classNames(
          "glass relative flex h-full w-full flex-col items-center gap-3 rounded-lg border border-line p-3 text-center transition-colors duration-150 hover:border-line-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          className,
        )}
        onClick={(event) => showModalFrom(dialogRef.current, event.currentTarget)}
        type="button"
      >
        {badge ? <span className="absolute end-3 top-3 z-10">{badge}</span> : null}
        <span className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-neutral-100" data-credential-scan="">
          <span className="absolute inset-2">
            <Image alt="" className="object-contain" fill sizes="(min-width: 1024px) 200px, (min-width: 640px) 40vw, 80vw" src={image.src} />
          </span>
        </span>
        <CardText code={code} label={label} />
      </button>
      <dialog
        aria-labelledby={titleId}
        className="m-auto w-[min(42rem,calc(100%-2.5rem))] rounded-lg border border-line bg-elevated p-0 text-primary shadow-elevated backdrop:bg-navy-950/70"
        ref={dialogRef}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
          <p className="font-display text-body-m text-primary" id={titleId}>
            {label ?? code}
          </p>
          <button
            aria-label={t("closeDocument")}
            autoFocus
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong transition-colors duration-150 hover:border-accent"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="flex justify-center bg-neutral-100 p-4">
          <Image
            alt=""
            className="h-auto max-h-[75vh] w-auto max-w-full"
            height={image.height}
            src={image.src}
            style={{ maxWidth: image.width }}
            width={image.width}
          />
        </div>
      </dialog>
    </>
  );
}

function CardText({ code, label }: { readonly code?: string; readonly label?: string }) {
  return (
    <>
      {code ? (
        <span className="font-latin text-base font-bold text-primary" dir="ltr">
          {code}
        </span>
      ) : null}
      {label ? <span className={classNames(code ? "text-caption text-muted" : "font-display text-h4 text-primary")}>{label}</span> : null}
    </>
  );
}
