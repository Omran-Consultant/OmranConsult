"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { LanguageSwitchLink } from "@/core/i18n/locale-switcher";
import { ThemeToggle } from "@/core/theme/theme-toggle";
import { LinkButton } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { MobileMenu } from "@/features/layout/components/mobile-menu";
import { CONTACT_HREF, hasPhotoHero, isActiveNavHref, PRIMARY_NAV_ITEMS } from "@/features/layout/navigation";
import { Link, usePathname } from "@/i18n/navigation";

const SCROLL_THRESHOLD = 80;

type SiteHeaderProps = {
  readonly email?: string;
};

/**
 * Figma "Site Header": transparent over a photo hero; after 80 px of scroll it gets bg/base at
 * 85 %, blur 24 and a bottom border (200 ms). Solid bg/base on pages without a photo hero.
 */
export function SiteHeader({ email }: SiteHeaderProps) {
  const t = useTranslations("Layout");
  const pathname = usePathname();
  const overHero = hasPhotoHero(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const transparent = overHero && !scrolled;

  return (
    <>
      <a
        className="sr-only z-60 rounded-full bg-accent-strong px-5 py-3 text-label-m text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
        href="#main-content"
      >
        {t("skipToContent")}
      </a>
      <header
        className={classNames(
          "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-200 ease-in-out",
          transparent && "scheme-dark border-white/10 bg-transparent",
          !transparent && overHero && "border-line bg-header-glass backdrop-blur-[24px]",
          !transparent && !overHero && (scrolled ? "border-line bg-canvas" : "border-transparent bg-canvas"),
        )}
        data-section="header"
      >
        <div className="container-page flex h-19.5 items-center justify-between gap-6 lg:h-29 lg:justify-start lg:gap-0">
          <Link className="shrink-0" href="/">
            <BrandLogo alt={t("brand.logoAlt")} className="h-auto w-27.5 lg:w-37.5" priority surface="adaptive" />
          </Link>

          <nav aria-label={t("nav.primaryLabel")} className="hidden lg:ms-10 lg:block xl:ms-30 2xl:ms-50">
            <ul className="flex items-center gap-8 xl:gap-10">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const active = isActiveNavHref(item.href, pathname);
                return (
                  <li key={item.href}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={classNames(
                        "text-label-m transition-colors duration-150",
                        active ? "text-accent" : "text-secondary hover:text-primary",
                      )}
                      href={item.href}
                    >
                      {t(`nav.${item.messageKey}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-5 lg:ms-auto lg:flex">
            <LinkButton arrow href={CONTACT_HREF} variant="secondary">
              {t("nav.contact")}
            </LinkButton>
            <LanguageSwitchLink className="text-secondary" />
            <ThemeToggle />
          </div>

          <button
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            aria-label={t("nav.toggleMenu")}
            className="glass flex size-11.5 items-center justify-center rounded-full border border-line-strong text-primary transition-colors duration-150 hover:border-accent lg:hidden"
            onClick={() => setMenuOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>
      {overHero ? null : <div aria-hidden="true" className="h-19.5 shrink-0 lg:h-29" />}
      <MobileMenu email={email} onClose={closeMenu} open={menuOpen} returnFocusRef={menuButtonRef} />
    </>
  );
}
