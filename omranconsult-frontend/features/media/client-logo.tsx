import Image from "next/image";

import type { AppLocale } from "@/i18n/routing";

import { getClientLogo } from "./brand-logos";

type ClientLogoProps = {
  readonly locale: AppLocale;
  readonly slug: string | null | undefined;
  readonly sortOrder: number;
  readonly name: string | null | undefined;
  readonly className?: string;
};

export function ClientLogo({ className, locale, name, slug, sortOrder }: ClientLogoProps) {
  const logo = getClientLogo(slug, sortOrder);
  if (!logo) {
    return null;
  }

  const alt = name?.trim() ? name : locale === "ar" ? "شعار عميل" : "Client logo";

  const boxClassName = className
    ? `flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-white p-3 dark:border-white/10 ${className}`
    : "flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-white p-3 dark:border-white/10";

  return (
    <div className={boxClassName}>
      <Image
        alt={alt}
        className="max-h-16 w-full object-contain"
        height={logo.height}
        sizes="(max-width: 768px) 25vw, 120px"
        src={logo.src}
        width={logo.width}
      />
    </div>
  );
}
