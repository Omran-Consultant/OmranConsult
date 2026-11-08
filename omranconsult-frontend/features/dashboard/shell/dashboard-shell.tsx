"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { BrandLogo } from "@/features/layout/components/brand-logo";
import { persistDashboardLocale } from "@/features/dashboard/i18n/locale";
import { DASHBOARD_NAV } from "@/features/dashboard/shell/nav";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { useTheme } from "@/core/theme/theme-provider";
import { Button } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { InputField } from "@/core/ui/input-field";
import { Skeleton } from "@/core/ui/skeleton";
import { adminSearch } from "@/lib/api/admin-browser";
import type { AppLocale } from "@/i18n/routing";

export function DashboardShell({
  children,
  locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, can } = useDashboardSession();
  const { theme, toggleTheme } = useTheme();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ href: string; title: { ar?: string | null; en?: string | null } }[]>([]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        setPalette(false);
        setDrawer(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!palette || query.trim() === "") {
      return;
    }
    const handle = window.setTimeout(() => {
      void adminSearch(query.trim()).then((payload) => setResults(payload.data));
    }, 200);
    return () => window.clearTimeout(handle);
  }, [palette, query]);

  const shownResults = palette && query.trim() !== "" ? results : [];

  const nav = useMemo(
    () =>
      DASHBOARD_NAV.map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.permission || can(item.permission)),
      })).filter((group) => group.items.length > 0),
    [can],
  );

  function switchLocale() {
    const next = locale === "ar" ? "en" : "ar";
    persistDashboardLocale(next);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <Skeleton className="hidden h-screen lg:block" />
        <div className="p-8">
          <Skeleton className="h-10 w-64" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleLabel = user.roles.includes("super_admin") ? t("roles.super_admin") : t("roles.editor");

  return (
    <div className="min-h-screen bg-base text-primary">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        <aside
          className={classNames(
            "fixed inset-y-0 z-30 flex w-[280px] flex-col border-line bg-elevated lg:static",
            locale === "ar" ? "right-0 border-s" : "left-0 border-e",
            "transition-transform duration-200",
            drawer
              ? "translate-x-0"
              : locale === "ar"
                ? "max-lg:translate-x-full lg:translate-x-0"
                : "max-lg:-translate-x-full lg:translate-x-0",
          )}
        >
          <div className="flex items-center justify-between px-5 py-5">
            <BrandLogo alt={t("brand")} className="h-9 w-auto" surface="adaptive" />
            <button aria-label={t("closeMenu")} className="lg:hidden" onClick={() => setDrawer(false)} type="button">
              <Icon name="close" />
            </button>
          </div>
          <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
            {nav.map((group) => (
              <div key={group.labelKey}>
                <p className="px-3 pb-2 text-caption text-muted">{t(group.labelKey)}</p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                      <li key={item.href}>
                        <Link
                          className={classNames(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-m",
                            active ? "bg-tint text-accent" : "text-secondary hover:bg-highlight",
                          )}
                          href={item.href}
                        >
                          <Icon name={item.icon} />
                          {t(item.labelKey)}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
          <div className="space-y-3 border-t border-line p-4">
            <Link className="flex items-center gap-2 rounded-lg bg-tint px-3 py-3 text-label-s text-accent" href="/en" rel="noreferrer" target="_blank">
              <Icon name="globe" />
              {t("liveSite")}
            </Link>
            <div className="flex items-center justify-between gap-2">
              <Link className="min-w-0" href="/dashboard/profile">
                <p className="truncate text-label-m">{user.name}</p>
                <p className="text-caption text-muted">{roleLabel}</p>
              </Link>
              <Button onClick={() => void logout()} type="button" variant="ghost">
                {t("logout")}
              </Button>
            </div>
          </div>
        </aside>
        <div>
          <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-elevated/90 px-4 py-3 backdrop-blur">
            <button aria-label={t("openMenu")} className="lg:hidden" onClick={() => setDrawer(true)} type="button">
              <Icon name="menu" />
            </button>
            <button
              className="flex flex-1 items-center gap-2 rounded-md border border-line px-3 py-2 text-start text-body-s text-muted"
              onClick={() => setPalette(true)}
              type="button"
            >
              <Icon name="search" />
              {t("search.placeholder")}
              <kbd className="ms-auto text-caption">⌘K</kbd>
            </button>
            <button className="rounded-full border border-line p-2" onClick={switchLocale} type="button">
              {locale === "ar" ? "EN" : "ع"}
            </button>
            <button aria-label={t("theme")} className="rounded-full border border-line p-2" onClick={toggleTheme} type="button">
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <span className="rounded-full border border-line p-2 text-muted">
              <Icon label={t("notifications")} name="bell" />
            </span>
          </header>
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
      {palette ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/40 p-6" onClick={() => setPalette(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-elevated p-4 shadow-lg" onClick={(event) => event.stopPropagation()}>
            <InputField id="dashboard-search" label={t("search.label")} onChange={(event) => setQuery(event.target.value)} value={query} />
            <ul className="mt-3 space-y-1">
              {shownResults.map((result) => (
                <li key={result.href}>
                  <Link className="block rounded-md px-3 py-2 hover:bg-highlight" href={result.href}>
                    {locale === "ar" ? result.title.ar : result.title.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
