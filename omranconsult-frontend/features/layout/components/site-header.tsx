"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useFocusTrap } from "@/core/hooks/use-focus-trap";
import { HeaderLocaleSwitcher } from "@/core/i18n/locale-switcher";
import { ThemeToggle } from "@/core/theme/theme-toggle";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { Icon } from "@/core/ui/icon";
import { PRIMARY_NAV_ITEMS } from "@/features/layout/navigation";
import { Link } from "@/i18n/navigation";

const navLinkClassName =
  "px-3 py-2 font-bold text-secondary transition-colors hover:text-accent ";

const mobilePrimaryLinkClassName =
  "block rounded-lg px-4 py-3 font-bold text-primary transition-colors hover:bg-elevated hover:text-white";

export function SiteHeader() {
  const t = useTranslations("Layout.nav");
  const brandT = useTranslations("Layout.brand");

  const [mobileOpen, setMobileOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuTitleId = useId();

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useFocusTrap({
    active: mobileOpen,
    containerRef: mobileDrawerRef,
    initialFocusRef: mobileCloseButtonRef,
    restoreFocusRef: menuButtonRef,
  });

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobile();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen, closeMobile]);

  const mobilePanelClassName = mobileOpen
    ? "translate-x-0"
    : "translate-x-full rtl:-translate-x-full";

  return (
    <>
      <nav
        aria-label={t("primaryLabel")}
        className="sticky top-0 z-40 bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between sm:h-20">
            <Link className="flex items-center" href="/">
              <BrandLogo
                alt={brandT("logoAlt")}
                className="h-10 w-auto sm:h-12 md:h-14"
                priority
                surface="adaptive"
              />
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <Link className={navLinkClassName} href={item.href} key={item.href}>
                  {t(item.messageKey)}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <HeaderLocaleSwitcher />
              <ThemeToggle />
            </div>

            <button
              type="button"
              ref={menuButtonRef}
              aria-controls="mobile-primary-navigation"
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
              aria-label={mobileOpen ? t("closeMenu") : t("toggleMenu")}
              className="rounded-md p-2 text-secondary transition-colors hover:bg-surface lg:hidden "
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <Icon className="size-6" name="close" />
              ) : (
                <Icon className="size-6" name="menu" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div
        ref={mobileDrawerRef}
        aria-labelledby={mobileMenuTitleId}
        aria-modal="true"
        className={`fixed inset-0 z-50 flex transform flex-col bg-surface transition-all duration-300 ease-in-out motion-reduce:transition-none lg:hidden ${mobilePanelClassName}`}
        hidden={!mobileOpen}
        id="mobile-primary-navigation"
        role="dialog"
      >
        <h2 className="sr-only" id={mobileMenuTitleId}>
          {t("primaryLabel")}
        </h2>

        <div className="flex items-center justify-between border-b border-line p-4">
          <Link href="/" onClick={closeMobile}>
            <BrandLogo alt={brandT("logoAlt")} className="h-10 w-auto" surface="adaptive" />
          </Link>
          <button
            type="button"
            ref={mobileCloseButtonRef}
            aria-label={t("closeMenu")}
            className="rounded-md p-2 text-secondary transition-colors hover:bg-surface "
            onClick={closeMobile}
          >
            <Icon className="size-6" name="close" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="space-y-2">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <Link
                className={mobilePrimaryLinkClassName}
                href={item.href}
                key={item.href}
                onClick={closeMobile}
              >
                {t(item.messageKey)}
              </Link>
            ))}
          </div>

          <div className="mt-auto flex items-center gap-3 border-t border-line pt-4">
            <HeaderLocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
