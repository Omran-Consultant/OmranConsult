"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, type RefObject } from "react";

import { useFocusTrap } from "@/core/hooks/use-focus-trap";
import { LanguageSwitchLink } from "@/core/i18n/locale-switcher";
import { ThemeToggle } from "@/core/theme/theme-toggle";
import { LinkButton } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { SITE_IMAGES } from "@/features/media/profile-images";
import { CONTACT_HREF, isActiveNavHref, MOBILE_NAV_ITEMS } from "@/features/layout/navigation";
import { Link, usePathname } from "@/i18n/navigation";

type MobileMenuProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly returnFocusRef: RefObject<HTMLButtonElement | null>;
  readonly email?: string;
};

/**
 * Figma "Mobile Menu — Open": full screen, slides in from the bottom (300 ms), links staggered
 * by 40 ms, focus trap, Esc closes, focus returns to the menu button.
 */
export function MobileMenu({ open, onClose, returnFocusRef, email }: MobileMenuProps) {
  const t = useTranslations("Layout");
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap({ active: open, containerRef: panelRef, initialFocusRef: closeRef, restoreFocusRef: returnFocusRef });

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  // Close when the route changes (a link was followed).
  const lastPathRef = useRef(pathname);
  useEffect(() => {
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      onClose();
    }
  }, [pathname, onClose]);

  return (
    <div
      aria-labelledby="mobile-menu-title"
      aria-modal="true"
      className={classNames(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-canvas duration-300 ease-out lg:hidden",
        // Visibility switches at once on open (so focus can move in) and only after the slide on close.
        open ? "visible translate-y-0 transition-transform" : "invisible translate-y-full transition-[transform,visibility]",
      )}
      id="mobile-menu"
      inert={!open}
      ref={panelRef}
      role="dialog"
    >
      <h2 className="sr-only" id="mobile-menu-title">
        {t("nav.menuLabel")}
      </h2>

      <span aria-hidden="true" className="earth-ring pointer-events-none absolute -end-105 top-105 size-175 overflow-hidden rounded-full">
        {/* Loaded only while the menu is open, so the hidden menu costs nothing on page load. */}
        {open ? <Image alt="" className="object-cover" fill quality={60} sizes="700px" src={SITE_IMAGES.earth.src} /> : null}
      </span>

      <div className="container-page relative flex h-19.5 shrink-0 items-center justify-between">
        <Link className="shrink-0" href="/">
          <BrandLogo alt={t("brand.logoAlt")} className="h-auto w-27.5" surface="adaptive" />
        </Link>
        <button
          aria-label={t("nav.closeMenu")}
          className="flex size-11.5 items-center justify-center rounded-full border border-line-strong bg-surface text-primary transition-colors duration-150 hover:border-accent"
          onClick={onClose}
          ref={closeRef}
          type="button"
        >
          <Icon name="close" />
        </button>
      </div>

      <nav aria-label={t("nav.primaryLabel")} className="container-page relative mt-8 flex-1 overflow-y-auto">
        <ul>
          {MOBILE_NAV_ITEMS.map((item, index) => {
            const active = isActiveNavHref(item.href, pathname);
            return (
              <li
                className={classNames(
                  "border-b border-line transition-[opacity,transform] duration-300 ease-out",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
                key={item.href}
                style={{ transitionDelay: open ? `${index * 40}ms` : "0ms" }}
              >
                <Link
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-16 items-center justify-between gap-4 py-4"
                  href={item.href}
                  onClick={onClose}
                >
                  <span className={classNames("font-display text-h3", active ? "text-accent" : "text-primary")}>
                    {t(`nav.${item.messageKey}`)}
                  </span>
                  <span className={classNames("num-isolate font-latin text-overline", active ? "text-accent" : "text-muted")}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="container-page relative flex shrink-0 flex-col gap-5 pt-6 pb-8">
        <LinkButton arrow className="w-full" href={CONTACT_HREF}>
          {t("nav.consultation")}
        </LinkButton>
        <div className="flex items-center justify-center gap-3 text-caption text-muted">
          <LanguageSwitchLink className="flex min-h-11 items-center" variant="long" />
          {email ? (
            <>
              <span aria-hidden="true">·</span>
              <a className="flex min-h-11 items-center transition-colors duration-150 hover:text-primary" dir="ltr" href={`mailto:${email}`}>
                {email}
              </a>
            </>
          ) : null}
          <ThemeToggle className="ms-1" />
        </div>
      </div>
    </div>
  );
}
