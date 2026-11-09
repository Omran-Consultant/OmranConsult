"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { adminResetPassword } from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";

export function ResetPasswordScreen() {
  const t = useTranslations("Dashboard.login");
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminResetPassword({
        token: params.get("token") ?? "",
        email: params.get("email") ?? "",
        password,
        password_confirmation: confirmation,
      });
      setDone(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? t("resetInvalid") : t("resetInvalid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[460px] flex-col items-center justify-center gap-6 px-5" data-ready="true">
      <BrandLogo alt={t("brand")} className="h-14 w-auto" surface="adaptive" />
      <section className="w-full rounded-3xl border border-line bg-elevated p-8">
        {done ? (
          <div className="space-y-4">
            <p>{t("resetSuccess")}</p>
            <Button onClick={() => router.push("/dashboard/login")} type="button">
              {t("submit")}
            </Button>
          </div>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={(event) => void submit(event)}>
            <h1 className="font-display text-h3">{t("resetTitle")}</h1>
            <InputField id="new-password" label={t("password")} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            <InputField id="confirm-password" label={t("passwordConfirm")} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
            {error ? <p className="text-body-s text-danger">{error}</p> : null}
            <Button loading={loading} type="submit">
              {t("savePassword")}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
