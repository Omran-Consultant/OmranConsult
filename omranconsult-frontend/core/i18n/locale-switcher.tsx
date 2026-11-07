"use client";

import { useLocale, useTranslations } from "next-intl";

import { classNames } from "@/core/ui/class-names";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

type LanguageSwitchLinkProps = {
  /** `short`: "EN" / "ع" (header). `long`: "English" / "العربية" (mobile menu). */
  readonly variant?: "short" | "long";
  readonly className?: string;
};

/** Switches the public locale and keeps the current path (`/en/...` ↔ `/ar/...`). */
export function LanguageSwitchLink({ variant = "short", className }: LanguageSwitchLinkProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("Layout.language");
  const targetLocale: AppLocale = locale === "en" ? "ar" : "en";

  return (
    <Link
      className={classNames(
        "transition-colors duration-150 hover:text-primary",
        variant === "short" && "font-latin text-overline",
        className,
      )}
      href={pathname}
      hrefLang={targetLocale}
      lang={targetLocale}
      locale={targetLocale}
    >
      {variant === "short" ? t("switchShort") : t("switchLong")}
    </Link>
  );
}
