"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
import { persistDashboardLocale } from "@/features/dashboard/i18n/locale";
import { adminLogin, adminLogout, adminMe } from "@/lib/api/admin-browser";
import { setDashboardUnauthorizedHandler } from "@/lib/api/browser-client";
import { ApiError } from "@/lib/api/errors";
import type { AdminUser } from "@/lib/api/types";
import type { AppLocale } from "@/i18n/routing";

type SessionValue = {
  user: AdminUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  can: (permission: string) => boolean;
};

const SessionContext = createContext<SessionValue | null>(null);

export function DashboardSessionProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  const router = useRouter();
  const t = useTranslations("Dashboard.session");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await adminMe();
      setUser(response.user);
      setEmail(response.user.email);
      const preferred = response.user.dashboard_locale;
      if (preferred && preferred !== locale) {
        persistDashboardLocale(preferred);
        router.refresh();
      }
    } catch (error) {
      setUser(null);
      if (error instanceof ApiError && error.status === 401) {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        router.replace(`/dashboard/login?next=${next}`);
      }
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    let cancelled = false;
    void adminMe()
      .then((response) => {
        if (cancelled) {
          return;
        }
        setUser(response.user);
        setEmail(response.user.email);
        const preferred = response.user.dashboard_locale;
        if (preferred && preferred !== locale) {
          persistDashboardLocale(preferred);
          router.refresh();
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setUser(null);
        if (error instanceof ApiError && error.status === 401) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          router.replace(`/dashboard/login?next=${next}`);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [locale, router]);

  useEffect(() => {
    if (!user) {
      setDashboardUnauthorizedHandler(null);
      return;
    }
    setDashboardUnauthorizedHandler(() => setExpired(true));
    return () => setDashboardUnauthorizedHandler(null);
  }, [user]);

  const logout = useCallback(async () => {
    await adminLogout();
    setUser(null);
    router.replace("/dashboard/login");
  }, [router]);

  async function relogin(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await adminLogin({ email, password, remember: true });
      if ("mfa_required" in result && result.mfa_required) {
        setError(t("mfaNeeded"));
        return;
      }
      setExpired(false);
      setPassword("");
      await refresh();
    } catch {
      setError(t("invalid"));
    } finally {
      setSubmitting(false);
    }
  }

  const value = useMemo<SessionValue>(
    () => ({
      user,
      loading,
      refresh,
      logout,
      can: (permission: string) => Boolean(user?.permissions.includes(permission)),
    }),
    [user, loading, refresh, logout],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
      {expired ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4">
          <form className="w-full max-w-md space-y-4 rounded-2xl bg-elevated p-6" onSubmit={(event) => void relogin(event)}>
            <h2 className="font-display text-h4">{t("title")}</h2>
            <p className="text-body-s text-secondary">{t("body")}</p>
            <InputField id="relogin-email" label={t("email")} onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            <InputField id="relogin-password" label={t("password")} onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            {error ? <p className="text-body-s text-danger">{error}</p> : null}
            <Button loading={submitting} type="submit">
              {t("submit")}
            </Button>
          </form>
        </div>
      ) : null}
    </SessionContext.Provider>
  );
}

export function useDashboardSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useDashboardSession must be used inside DashboardSessionProvider");
  }
  return value;
}
