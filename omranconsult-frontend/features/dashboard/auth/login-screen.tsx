"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useTheme } from "@/core/theme/theme-provider";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { AuthField } from "@/features/dashboard/auth/auth-field";
import { persistDashboardLocale, safeDashboardNext } from "@/features/dashboard/i18n/locale";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { adminForgotPassword, adminLogin, adminLoginMfa } from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";
import type { AppLocale } from "@/i18n/routing";

type Mode = "login" | "mfa" | "forgot" | "sent";

export function LoginScreen({ locale }: { locale: AppLocale }) {
  const t = useTranslations("Dashboard.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchLocale() {
    persistDashboardLocale(locale === "ar" ? "en" : "ar");
    router.refresh();
  }

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await adminLogin({ email, password, remember });
      if ("mfa_required" in result && result.mfa_required) {
        setMode("mfa");
        return;
      }
      router.replace(safeDashboardNext(searchParams.get("next")));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 423) {
        setError(t("locked", { minutes: caught.minutesRemaining ?? 15 }));
      } else {
        setError(t("invalid"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitMfa(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminLoginMfa(recovery ? { recovery_code: code } : { code });
      router.replace(safeDashboardNext(searchParams.get("next")));
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 423) {
        setError(t("locked", { minutes: caught.minutesRemaining ?? 15 }));
      } else {
        setError(t("mfaInvalid"));
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminForgotPassword(email);
      setMode("sent");
    } catch {
      setMode("sent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-primary" data-dashboard-surface data-ready="true">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_45%_at_85%_0%,rgb(14_132_66_/_0.16),transparent_70%),radial-gradient(45%_50%_at_10%_100%,rgb(27_61_101_/_0.16),transparent_70%),linear-gradient(rgb(12_27_48_/_0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(12_27_48_/_0.05)_1px,transparent_1px)] bg-[length:auto,auto,48px_48px,48px_48px] [mask-image:radial-gradient(70%_70%_at_50%_45%,#000_40%,transparent_100%)]"
      />
      <header className="relative flex justify-end gap-2 p-6">
        <button className="rounded-full border border-line px-3 py-1 text-label-s" onClick={switchLocale} type="button">
          {locale === "ar" ? "EN" : "ع"}
        </button>
        <button
          aria-label={t("theme")}
          className="rounded-full border border-line p-2"
          onClick={toggleTheme}
          type="button"
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
      </header>
      <main className="relative mx-auto flex max-w-[460px] flex-col items-center gap-6 px-5 pb-16">
        <BrandLogo alt={t("brand")} className="h-14 w-auto" priority surface="adaptive" />
        <section className="relative w-full rounded-3xl border border-line bg-elevated p-8 shadow-[0_24px_48px_-24px_rgb(8_19_34_/_0.18)] before:absolute before:inset-x-10 before:top-[-1px] before:h-[3px] before:rounded-b before:bg-gradient-to-r before:from-transparent before:via-accent before:to-transparent">
          {mode === "login" ? (
            <form className="flex flex-col gap-5" onSubmit={(event) => void submitLogin(event)}>
              <div>
                <h1 className="font-display text-h3">{t("title")}</h1>
                <p className="mt-2 text-body-s text-secondary">{t("subtitle")}</p>
              </div>
              <AuthField
                autoComplete="username"
                icon="mail"
                id="email"
                label={t("email")}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <AuthField
                autoComplete="current-password"
                icon="lock"
                id="password"
                label={t("password")}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
              <div className="flex items-center justify-between gap-3 text-body-s">
                <label className="flex items-center gap-2 rounded-sm text-secondary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent">
                  <span
                    className={classNames(
                      "grid size-[18px] place-items-center rounded-[5px] border",
                      remember ? "border-accent-strong bg-accent-strong text-white" : "border-line-strong bg-white",
                    )}
                  >
                    {remember ? <Icon className="size-3" name="check" /> : null}
                  </span>
                  <input
                    checked={remember}
                    className="sr-only"
                    onChange={(event) => setRemember(event.target.checked)}
                    type="checkbox"
                  />
                  {t("remember")}
                </label>
                <button className="text-accent" onClick={() => setMode("forgot")} type="button">
                  {t("forgot")}
                </button>
              </div>
              {error ? <p className="text-body-s text-danger">{error}</p> : null}
              <DashboardButton loading={loading} type="submit">
                {t("submit")}
              </DashboardButton>
              <p className="flex items-center gap-2 text-caption text-muted">
                <Icon name="shield-check" />
                {t("lockNote")}
              </p>
            </form>
          ) : null}
          {mode === "mfa" ? (
            <form className="flex flex-col gap-5" onSubmit={(event) => void submitMfa(event)}>
              <h1 className="font-display text-h3">{t("mfaTitle")}</h1>
              <AuthField
                autoComplete="one-time-code"
                icon="shield-check"
                id="mfa"
                inputMode="numeric"
                label={recovery ? t("recovery") : t("code")}
                onChange={(event) => setCode(event.target.value)}
                required
                value={code}
              />
              <button className="text-start text-body-s text-accent" onClick={() => setRecovery((value) => !value)} type="button">
                {recovery ? t("useApp") : t("useRecovery")}
              </button>
              {error ? <p className="text-body-s text-danger">{error}</p> : null}
              <DashboardButton loading={loading} type="submit">
                {t("submit")}
              </DashboardButton>
            </form>
          ) : null}
          {mode === "forgot" ? (
            <form className="flex flex-col gap-5" onSubmit={(event) => void submitForgot(event)}>
              <h1 className="font-display text-h3">{t("forgotTitle")}</h1>
              <AuthField
                icon="mail"
                id="forgot-email"
                label={t("email")}
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
              <DashboardButton loading={loading} type="submit">
                {t("sendReset")}
              </DashboardButton>
              <button className="text-body-s text-accent" onClick={() => setMode("login")} type="button">
                {t("backLogin")}
              </button>
            </form>
          ) : null}
          {mode === "sent" ? (
            <div className="space-y-4">
              <p className="text-body-m">{t("resetSent")}</p>
              <button className="text-body-s text-accent" onClick={() => setMode("login")} type="button">
                {t("backLogin")}
              </button>
            </div>
          ) : null}
        </section>
        <Link className="inline-flex items-center gap-1.5 text-body-s text-accent" href="/en">
          <Icon name="arrow" />
          {t("back")}
        </Link>
      </main>
    </div>
  );
}
