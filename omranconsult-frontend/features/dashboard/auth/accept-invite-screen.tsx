"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { InputField } from "@/core/ui/input-field";
import { BrandLogo } from "@/features/layout/components/brand-logo";
import { adminAcceptInvite } from "@/lib/api/admin-browser";
import { ApiError } from "@/lib/api/errors";

export function AcceptInviteScreen() {
  const t = useTranslations("Dashboard.login");
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminAcceptInvite({
        token: params.get("token") ?? "",
        email: params.get("email") ?? "",
        password,
        password_confirmation: confirmation,
      });
      router.replace("/dashboard/login");
    } catch (caught) {
      setError(caught instanceof ApiError ? t("inviteInvalid") : t("inviteInvalid"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[460px] flex-col items-center justify-center gap-6 px-5" data-ready="true">
      <BrandLogo alt={t("brand")} className="h-14 w-auto" surface="adaptive" />
      <section className="w-full rounded-3xl border border-line bg-elevated p-8">
        <form className="flex flex-col gap-5" onSubmit={(event) => void submit(event)}>
          <h1 className="font-display text-h3">{t("inviteTitle")}</h1>
          <InputField id="invite-password" label={t("password")} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          <InputField id="invite-confirm" label={t("passwordConfirm")} onChange={(event) => setConfirmation(event.target.value)} required type="password" value={confirmation} />
          {error ? <p className="text-body-s text-danger">{error}</p> : null}
          <DashboardButton loading={loading} type="submit">
            {t("acceptInvite")}
          </DashboardButton>
        </form>
      </section>
    </main>
  );
}
