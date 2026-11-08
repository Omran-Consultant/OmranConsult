"use client";

import { useTranslations } from "next-intl";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { useTheme } from "@/core/theme/theme-provider";

/** Icon button in the header style; light defaults and dark remains available per A35. */
export function ThemeToggle({ className }: { readonly className?: string }) {
  const t = useTranslations("Layout.theme");
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? t("switchToLight") : t("switchToDark")}
      className={classNames(
        "flex size-11 items-center justify-center rounded-full text-secondary transition-colors duration-150 hover:bg-tint hover:text-primary",
        className,
      )}
      onClick={toggleTheme}
      type="button"
    >
      <Icon name={isDark ? "sun" : "moon"} />
    </button>
  );
}
