"use client";

import { useTranslations } from "next-intl";

import { useTheme } from "@/core/theme/theme-provider";
import { MoonIcon, SunIcon } from "@/features/layout/components/site-icons";

export function ThemeToggle() {
  const t = useTranslations("Layout.theme");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-full bg-surface-muted text-foreground transition-colors hover:bg-border dark:bg-brand-navy dark:hover:bg-brand-navy-deep"
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
    >
      {isDark ? (
        <SunIcon className="size-5" />
      ) : (
        <MoonIcon className="size-5" />
      )}
    </button>
  );
}
