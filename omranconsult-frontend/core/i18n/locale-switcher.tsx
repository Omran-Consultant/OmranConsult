"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";

const headerSwitcherClassName =
  "inline-flex size-10 items-center justify-center rounded-full bg-elevated text-sm font-bold text-white transition-colors hover:bg-accent-strong ";

const defaultSwitcherClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line bg-surface px-3 text-sm font-medium text-primary transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

type LocaleSwitcherLinkProps = {
  variant?: "default" | "header";
  className?: string;
};

export function LocaleSwitcherLink({
  variant = "default",
  className,
}: LocaleSwitcherLinkProps) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const targetLocale: AppLocale = locale === "en" ? "ar" : "en";
  const targetLabel =
    targetLocale === "en" ? t("switchToEnglish") : t("switchToArabic");
  const variantClassName =
    variant === "header" ? headerSwitcherClassName : defaultSwitcherClassName;

  return (
    <Link
      href={pathname}
      locale={targetLocale}
      className={className ? `${variantClassName} ${className}` : variantClassName}
      aria-label={`${t("label")}: ${targetLabel}`}
    >
      {targetLabel}
    </Link>
  );
}

type LocaleSwitcherProps = {
  variant?: "default" | "header";
};

/** Standalone locale control with a single navigation landmark (non-header surfaces). */
export function LocaleSwitcher({ variant = "default" }: LocaleSwitcherProps) {
  const t = useTranslations("LocaleSwitcher");

  return (
    <nav aria-label={t("label")}>
      <LocaleSwitcherLink variant={variant} />
    </nav>
  );
}

type HeaderLocaleSwitcherProps = {
  /** When true, removes the control from layout and the accessibility tree. */
  hidden?: boolean;
};

/** Header/mobile drawer locale toggle without an extra landmark wrapper. */
export function HeaderLocaleSwitcher({ hidden = false }: HeaderLocaleSwitcherProps) {
  if (hidden) {
    return null;
  }

  return <LocaleSwitcherLink variant="header" />;
}
