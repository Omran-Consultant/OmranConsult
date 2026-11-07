"use client";

import { useTranslations } from "next-intl";

import { useTheme } from "@/core/theme/theme-provider";
import { Icon } from "@/core/ui/icon";

export function ThemeToggle() {
  const t = useTranslations("Layout.theme");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-line "
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
    >
      {isDark ? (
        <Icon className="size-5" name="sun" />
      ) : (
        <Icon className="size-5" name="moon" />
      )}
    </button>
  );
}
