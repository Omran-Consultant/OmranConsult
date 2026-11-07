import Image from "next/image";

import type { AppLocale } from "@/i18n/routing";

import { getClientLogo } from "./brand-logos";

type ProjectOwnerLogoProps = {
  readonly locale: AppLocale;
  readonly slug: string | null | undefined;
  readonly sortOrder?: number;
  readonly name: string | null | undefined;
};

export function ProjectOwnerLogo({ locale, name, slug, sortOrder = 0 }: ProjectOwnerLogoProps) {
  const logo = slug ? getClientLogo(slug, sortOrder) : sortOrder > 0 ? getClientLogo(null, sortOrder) : undefined;
  if (!logo) {
    return null;
  }

  const alt = name?.trim() ? name : locale === "ar" ? "شعار عميل" : "Client logo";

  return (
    <div className="mb-3 flex h-16 items-center justify-center rounded-lg border border-border bg-white p-2">
      <Image
        alt={alt}
        className="max-h-12 w-full object-contain"
        height={logo.height}
        sizes="160px"
        src={logo.src}
        width={logo.width}
      />
    </div>
  );
}
